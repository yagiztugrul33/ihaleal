# Emlakci gelir paylasimi ve risk

- Hedef B2B: REALTOR_B2B_RATE (fees.ts) = %2 matrah, KDV ayri
- Ilk kapanis payi: realtorPayoutPolicy.ts POLICY_FIRST_CLOSING_AGENT_SHARE_HELD_IN_POOL
- Sonraki islemler: evaluateRealtorPayoutStub, SUBSEQUENT_DEAL_PAYOUT_HOLD_DAYS
- Risk: risk raporu sunucu imzasi, NLP, takasbank, fatura eslesmesi, AML