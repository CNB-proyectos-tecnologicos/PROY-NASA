import unittest
from modelos_espaciales import *
class TestAstronautHealth(unittest.TestCase):
    def test_audio_85(self): self.assertAlmostEqual(acoustic_dose_24h_percent([(85,480)]),100.)
    def test_audio_88(self): self.assertAlmostEqual(acoustic_dose_24h_percent([(88,240)]),100.)
    def test_o2(self):self.assertAlmostEqual(oxygen_inspired_mmHg(760,.21),149.73)
    def test_o2_invalid(self):
        with self.assertRaises(ValueError):oxygen_inspired_mmHg(47,.21)
    def test_radiation_600(self):self.assertEqual(nasa_operational_limits({'career_effective_mSv':600})['radiacion_carrera']['state'],'INCUMPLE')
    def test_co2(self):self.assertEqual(nasa_operational_limits({'cabin_ppco2_1h_mmHg':3.1})['cabina_CO2_1h']['state'],'INCUMPLE')
    def test_missing(self):self.assertEqual(nasa_operational_limits({})['cabina_CO2_1h']['state'],'NO_CALCULABLE')
    def test_vo2_mission_gating(self): self.assertNotIn('vo2_eva_micro',nasa_operational_limits({},{}))
    def test_vte_score(self):
        x=SpaceVTEScoreInput(48,'none','none',False,'none',True,65)
        self.assertEqual(nasa_vte_2026_proposal_score(x)['score'],7)
    def test_vte_missing(self):
        with self.assertRaises(ValueError):nasa_vte_2026_proposal_score(SpaceVTEScoreInput(48,'unknown','none',False,'none',True,65))
    def test_sans(self): self.assertEqual(sans_oct_category(56)['category'],'B')
    def test_sans_A(self): self.assertEqual(sans_oct_category(20)['category'],'A')
    def test_strength(self):self.assertFalse(nasa_bone_strength_exposure(hip_ratio=.94)['hip']['meets_target'])
    def test_wilson(self):
        x=wilson_binomial_interval(52,64)
        self.assertLess(x['lower'],x['observed_fraction']);self.assertLess(x['observed_fraction'],x['upper'])
    def test_alert_abstain(self):self.assertEqual(alert_if_observed(None,'>',3),'NO_CALCULABLE')
    def test_bad_sensor(self):self.assertEqual(alert_if_observed(100,'>',3,False),'VERIFICAR_SENSOR')
if __name__=='__main__':unittest.main()
