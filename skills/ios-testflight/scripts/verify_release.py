#!/usr/bin/env python3
"""Read-only TestFlight checks; ASC CLI owns all App Store Connect access."""

import argparse
import hashlib
import json
from pathlib import Path
import plistlib
import subprocess
import sys
import tempfile
import zipfile


def require(condition, message):
    if not condition:
        raise ValueError(message)


def check_info(info, args):
    for key, expected in [
        ('CFBundleIdentifier', args.bundle_id),
        ('CFBundleShortVersionString', args.version),
        ('CFBundleVersion', args.build),
    ]:
        require(info.get(key) == expected, f'{key} does not match the requested release')
    require(info.get('TFInternalTestingOnly') is True, 'TFInternalTestingOnly must be true')
    require(info.get('ITSAppUsesNonExemptEncryption') is (args.encryption == 'true'),
            'Encryption declaration does not match the project')
    require(all(isinstance(v, str) and v.strip() for k, v in info.items()
                if k.endswith('UsageDescription')), 'Empty usage description')


def verify_ipa(args):
    ipa = Path(args.ipa)
    with zipfile.ZipFile(ipa) as archive:
        names = [n for n in archive.namelist() if n.startswith('Payload/')
                 and n.count('/') == 2 and n.endswith('.app/Info.plist')]
        require(len(names) == 1, 'IPA must contain exactly one top-level App Info.plist')
        info = plistlib.loads(archive.read(names[0]))
        check_info(info, args)
        with tempfile.TemporaryDirectory(prefix='testflight-ipa-') as directory:
            root = Path(directory).resolve()
            require(all((root / n).resolve().is_relative_to(root) for n in archive.namelist()),
                    'Invalid archive path')
            archive.extractall(root)
            app = root / names[0].rsplit('/', 1)[0]
            privacy = plistlib.loads((app / 'PrivacyInfo.xcprivacy').read_bytes())
            expected_privacy = plistlib.loads(Path(args.privacy_manifest).read_bytes())
            require(privacy == expected_privacy, 'Privacy manifest differs from project source')
            require(not list(app.rglob('*.storekit')), 'Local StoreKit fixture in release')
            profile = plistlib.loads(subprocess.check_output([
                'security', 'cms', '-D', '-i', str(app / 'embedded.mobileprovision'),
            ], stderr=subprocess.DEVNULL))
            require(profile.get('TeamIdentifier') == [args.team_id], 'Unexpected signing team')
            require('ProvisionedDevices' not in profile and not profile.get('ProvisionsAllDevices'),
                    'Expected App Store provisioning profile')
            require(not profile['Entitlements'].get('get-task-allow'), 'Debug profile entitlement')
            subprocess.run(['codesign', '--verify', '--deep', '--strict', str(app)],
                           check=True, capture_output=True)
            signature = subprocess.check_output(['codesign', '-dvv', str(app)],
                                                stderr=subprocess.STDOUT)
            require(b'Authority=Apple Distribution:' in signature, 'Expected Apple Distribution')
            entitlements = plistlib.loads(subprocess.check_output([
                'codesign', '-d', '--entitlements', ':-', str(app),
            ], stderr=subprocess.DEVNULL))
            require(not entitlements.get('get-task-allow'), 'Debug code entitlement')
            require(entitlements.get('application-identifier') == f'{args.team_id}.{args.bundle_id}',
                    'Signed application identifier mismatch')
    digest = hashlib.sha256()
    with ipa.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return dict(bundleId=args.bundle_id, version=args.version, build=args.build,
                teamId=args.team_id, internalOnly=True, sha256=digest.hexdigest())


def asc_read(arguments, evidence_dir, name):
    # No generic caller-supplied command: every call site below is a read operation.
    result = subprocess.run(['asc', *arguments, '--output', 'json'],
                            check=True, capture_output=True, text=True, timeout=60)
    payload = json.loads(result.stdout)
    if evidence_dir:
        directory = Path(evidence_dir)
        directory.mkdir(parents=True, exist_ok=True)
        (directory / f'{name}.json').write_text(json.dumps(payload, indent=2) + '\n')
    return payload


def collect_server(args):
    read = lambda name, *command: asc_read(list(command), args.evidence_dir, name)
    build = read('build', 'builds', 'info', '--app', args.app_id, '--build-number', args.build,
                 '--version', args.version, '--platform', 'IOS')
    build_id = build['data']['id']
    return dict(
        build=build,
        app=read('app', 'builds', 'app', 'view', '--build-id', build_id),
        release=read('version', 'builds', 'pre-release-version', 'view', '--build-id', build_id),
        beta=read('beta', 'builds', 'build-beta-detail', 'view', '--build-id', build_id),
        group=read('group', 'testflight', 'groups', 'view', '--id', args.group_id),
        group_app=read('group-app', 'testflight', 'groups', 'app', 'view', '--group-id', args.group_id),
        testers=read('tester-links', 'testflight', 'groups', 'links', 'view',
                     '--group-id', args.group_id, '--type', 'betaTesters', '--paginate'),
        memberships=read('memberships', 'builds', 'groups', 'list', '--build-id', build_id),
    )


def check_server(snapshot, args):
    build = snapshot['build']['data']
    attributes = build['attributes']
    for source in ['app', 'group_app']:
        app = snapshot[source]['data']
        require(app['id'] == args.app_id and app['attributes']['bundleId'] == args.bundle_id,
                'Build or group belongs to a different app')
    release = snapshot['release']['data']['attributes']
    require(release['version'] == args.version and release['platform'] == 'IOS',
            'Wrong marketing version or platform')
    require(attributes['version'] == args.build, 'Wrong build number')
    require(attributes['processingState'] == 'VALID', 'Build is not VALID')
    require(attributes.get('expired') is False, 'Build expiry is not confirmed false')
    require(attributes.get('buildAudienceType') == 'INTERNAL_ONLY', 'Build is not INTERNAL_ONLY')
    group = snapshot['group']['data']
    require(group['id'] == args.group_id and group['attributes'].get('isInternalGroup') is True,
            'Expected the requested internal group')
    require(not group['attributes'].get('publicLinkEnabled'), 'Public link is enabled')
    testers = snapshot['testers']
    require(not testers.get('links', {}).get('next'), 'Tester pagination incomplete')
    require(len(testers['data']) > 0, 'Internal group has no testers')
    memberships = snapshot['memberships']
    require(memberships.get('complete') is True, 'Build group lookup incomplete')
    require(memberships['appId'] == args.app_id and memberships['buildId'] == build['id'],
            'Group lookup belongs to another build or app')
    require(all(g['type'] == 'internal' for g in memberships['groups']),
            'Build has an external group association')
    attached = any(g['id'] == args.group_id for g in memberships['groups'])
    beta = snapshot['beta']['data']['attributes']
    require(beta['externalBuildState'] == 'NOT_APPLICABLE', 'Unexpected external build state')
    if args.phase == 'published':
        require(attached and beta['internalBuildState'] == 'IN_BETA_TESTING',
                'Build is not testing in the requested internal group')
    return dict(appId=args.app_id, bundleId=args.bundle_id, version=args.version, build=args.build,
                buildId=build['id'], groupId=args.group_id, groupName=group['attributes']['name'],
                phase=args.phase, processingState=attributes['processingState'],
                buildAudienceType=attributes['buildAudienceType'], buildAttached=attached,
                testerCount=len(testers['data']), internalBuildState=beta['internalBuildState'],
                externalBuildState=beta['externalBuildState'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    ipa = commands.add_parser('ipa', help='Verify a distribution IPA locally on macOS')
    server = commands.add_parser('server', help='Verify server state with read-only ASC CLI commands')
    for command in [ipa, server]:
        command.add_argument('--bundle-id', required=True)
        command.add_argument('--version', required=True)
        command.add_argument('--build', required=True)
    ipa.add_argument('--ipa', required=True)
    ipa.add_argument('--team-id', required=True)
    ipa.add_argument('--privacy-manifest', required=True)
    ipa.add_argument('--encryption', choices=['true', 'false'], required=True)
    server.add_argument('--app-id', required=True)
    server.add_argument('--group-id', required=True)
    server.add_argument('--phase', choices=['ready', 'published'], required=True)
    server.add_argument('--evidence-dir')
    args = parser.parse_args()
    try:
        result = verify_ipa(args) if args.command == 'ipa' else check_server(collect_server(args), args)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except subprocess.CalledProcessError as error:
        print(f'Verification failed: {error.cmd[0]} exited {error.returncode}', file=sys.stderr)
        return 1
    except (OSError, ValueError, KeyError, TypeError, subprocess.TimeoutExpired,
            zipfile.BadZipFile, plistlib.InvalidFileException) as error:
        print(f'Verification failed: {error}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
