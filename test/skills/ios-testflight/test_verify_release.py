import copy
import importlib.util
from pathlib import Path
from types import SimpleNamespace
import unittest


path = Path(__file__).resolve().parents[3] / 'skills/ios-testflight/scripts/verify_release.py'
spec = importlib.util.spec_from_file_location('verify_release', path)
verify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(verify)


class ReleaseBoundaryTests(unittest.TestCase):
    def setUp(self):
        self.args = SimpleNamespace(app_id='app', bundle_id='example.app', version='1.2.0',
                                    build='2', group_id='internal', phase='published', encryption='false')
        app = {'data': {'id': 'app', 'attributes': {'bundleId': 'example.app'}}}
        self.snapshot = dict(
            app=app, group_app=copy.deepcopy(app),
            build={'data': {'id': 'build', 'attributes': dict(version='2', processingState='VALID',
                    expired=False, buildAudienceType='INTERNAL_ONLY')}},
            release={'data': {'attributes': dict(version='1.2.0', platform='IOS')}},
            group={'data': {'id': 'internal', 'attributes': dict(name='Internal', isInternalGroup=True)}},
            testers={'data': [{'id': 'existing-tester'}]},
            memberships=dict(complete=True, appId='app', buildId='build',
                             groups=[dict(id='internal', type='internal')]),
            beta={'data': {'attributes': dict(internalBuildState='IN_BETA_TESTING',
                                             externalBuildState='NOT_APPLICABLE')}},
        )

    def test_accepts_published_internal_build_without_personal_tester_data(self):
        result = verify.check_server(self.snapshot, self.args)
        self.assertEqual(result['testerCount'], 1)
        self.assertEqual(result['buildId'], 'build')
        self.assertNotIn('existing-tester', str(result))

    def test_rejects_wrong_marketing_version_even_with_same_build_number(self):
        self.snapshot['release']['data']['attributes']['version'] = '1.1.0'
        with self.assertRaisesRegex(ValueError, 'marketing version'):
            verify.check_server(self.snapshot, self.args)

    def test_rejects_cross_app_build_and_cross_app_group(self):
        for source in ['app', 'group_app']:
            data = copy.deepcopy(self.snapshot)
            data[source]['data']['id'] = 'another-app'
            with self.subTest(source=source), self.assertRaisesRegex(ValueError, 'different app'):
                verify.check_server(data, self.args)

    def test_rejects_non_internal_expired_or_unprocessed_build(self):
        for field, value in [('buildAudienceType', 'APP_STORE_ELIGIBLE'), ('expired', True),
                             ('expired', None), ('processingState', 'INVALID')]:
            data = copy.deepcopy(self.snapshot)
            data['build']['data']['attributes'][field] = value
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                verify.check_server(data, self.args)

    def test_rejects_external_group_and_incomplete_membership_lookup(self):
        for patch in [dict(complete=False), dict(groups=[dict(id='external', type='external')]),
                      dict(buildId='different-build')]:
            data = copy.deepcopy(self.snapshot)
            data['memberships'].update(patch)
            with self.subTest(patch=patch), self.assertRaises(ValueError):
                verify.check_server(data, self.args)

    def test_ready_can_plan_an_unattached_group_but_published_must_be_attached(self):
        self.snapshot['memberships']['groups'] = []
        self.args.phase = 'ready'
        self.assertFalse(verify.check_server(self.snapshot, self.args)['buildAttached'])
        self.args.phase = 'published'
        with self.assertRaises(ValueError):
            verify.check_server(self.snapshot, self.args)

    def test_rejects_public_link_empty_testers_and_non_testing_state(self):
        mutations = [lambda d: d['group']['data']['attributes'].update(publicLinkEnabled=True),
                     lambda d: d['testers'].update(data=[]),
                     lambda d: d['beta']['data']['attributes'].update(internalBuildState='READY_FOR_BETA_TESTING')]
        for mutate in mutations:
            data = copy.deepcopy(self.snapshot)
            mutate(data)
            with self.assertRaises(ValueError):
                verify.check_server(data, self.args)

    def test_ipa_header_rejects_wrong_app_or_missing_internal_flag_before_signing(self):
        info = dict(CFBundleIdentifier='example.app', CFBundleShortVersionString='1.2.0',
                    CFBundleVersion='2', TFInternalTestingOnly=True, ITSAppUsesNonExemptEncryption=False)
        verify.check_info(info, self.args)
        for patch in [dict(CFBundleIdentifier='another.app'), dict(TFInternalTestingOnly=False),
                      dict(TFInternalTestingOnly=None), dict(CFBundleVersion='1')]:
            with self.subTest(patch=patch), self.assertRaises(ValueError):
                verify.check_info({**info, **patch}, self.args)


if __name__ == '__main__':
    unittest.main()
