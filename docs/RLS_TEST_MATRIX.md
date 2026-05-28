# RLS Test Matrix (generated)

Generated: 2026-05-28T15:31:37.836Z

| Migration | Policies / functions |
|-----------|----------------------|
| 20260428120000_initial_schema.sql | handle_new_user |
| 20260428120100_rls_policies.sql | profiles_select_self, profiles_update_self, profiles_insert_self, listings_select_active, listings_insert_kyc |
| 20260428120200_place_bid_function.sql | place_bid |
| 20260429120000_profiles_extra_fields.sql | — |
| 20260429120100_bid_bonds_and_antisniping.sql | bid_bonds_select_own, bid_bonds_insert_own, bid_bonds_update_own, place_bid |
| 20260429120200_listings_rls_strict.sql | listings_insert_kyc_edevlet |
| 20260429120300_audit_log.sql | audit_log_admin_select |
| 20260429120400_memberships_service_fees_authorizations.sql | memberships_select_own, service_fees_select_own, authorizations_select_related, commission_records_select_party, agent_performance_select_own |
| 20260429140000_listings_insert_kyc_edevlet_idempotent.sql | listings_insert_kyc_edevlet |
| 20260430120000_write_policies_and_place_bid_v2.sql | memberships_select_self, memberships_insert_self, memberships_update_admin, service_fees_select_self, service_fees_insert_self, place_bid, calculate_commission_with_offset |
| 20260430140000_pre_launch_signups.sql | pre_launch_insert_anon, pre_launch_select_admin |
| 20260430150000_profiles_role_place_bid_antisniping.sql | place_bid |
| 20260501120000_ai_buynow_deposit.sql | reports_select_seller, reports_select_authenticated_active, reports_admin_all, reports_insert_seller, reports_update_seller, rate_limit_check, register_bid_deposit, execute_buy_now |
| 20260502120000_profiles_rls_recursion_service_grants.sql | profiles_select_admin, is_profile_admin |
| 20260504140000_chat_messages_compliance_stub.sql | chat_threads_participant_select, chat_threads_creator_insert, chat_participants_self_select, chat_participants_thread_member_insert, chat_messages_participant_select, post_chat_message |
| 20260516120000_admin_listing_security.sql | listings_select_admin, listings_update_admin, memberships_update_admin, admin_approve_listing |
| 20260516120001_v2_core_safety_additive.sql | rl_consume, write_audit_v2 |
| 20260516120100_v2_multi_tenant.sql | org_select_member, om_select_self_or_member, tg_set_updated_at, set_active_org, current_org_id |
| 20260516120200_v2_liquidity.sql | bp_owner, wl_owner, lm_owner, notif_owner_select, cc_public_read |
| 20260516120300_v2_kyc_moderation_bulk.sql | kyc_submitter_read, bj_org_read, cl_insert_anyone, org_dashboard_stats |
| 20260516120400_v2_pgmq_matching.sql | pgmq_send, pgmq_read, pgmq_delete |
| 20260517140000_land_ges_intelligence.sql | Users read own engineering runs, Users insert own engineering runs |
| 20260517150000_engineering_war_room.sql | — |
| 20260518120000_ibuyer_trade_in.sql | property_submissions_select_own, property_submissions_insert_own, property_risk_assessments_select_own, property_risk_assessments_insert_own, instant_offer_requests_select_own, ibuyer_calculate_risk_score, ibuyer_determine_status, ibuyer_calculate_offer |
| 20260518140000_ges_land_evaluation.sql | Users read own ges projects, Users insert own ges projects, Users update own ges projects, Users read technical via project, Users insert technical via project, ges_evaluate_hard_kill, ges_calculate_score, submit_ges_land_evaluation |
| 20260518200000_takas_enhancements.sql | submit_ibuyer_application, submit_takas_application |
| 20260518300000_trade_offers.sql | trade_offers_set_updated_at, create_trade_offer, respond_trade_offer |
| 20260521221500_harden_bids_visibility_and_public_views.sql | bids_select_bidder_or_listing_owner |
| 20260526162000_harden_events_moderation_rls_soft_delete.sql | mq_select_own_or_admin, mq_insert_own, mq_update_own_or_admin, mq_delete_soft_own_or_admin, ev_select_own_or_admin, soft_delete_moderation_queue, soft_delete_events |
| 20260526200500_harden_rate_limit_buckets_rls.sql | rate_limit_buckets_service_only |
| 20260527120000_buy_now_kyc_guard.sql | register_bid_deposit, execute_buy_now |
| 20260527130000_device_push_tokens.sql | dpt_owner_select, dpt_owner_modify, register_push_token, unregister_push_token |
| 20260527130100_security_bundle_5fix.sql | place_bid, calculate_commission_with_offset, submit_ges_land_evaluation |
| 20260528150000_rb1_rb2_rls_hardening.sql | — |
| 20260528170000_grants_restore_systemic.sql | — |

## Manual verification

- Run `RUN_RLS_INTEGRATION=1 npm run test:rls:live` when Supabase credentials available.
- Apply migration `20260516120000_admin_listing_security.sql` on production project.