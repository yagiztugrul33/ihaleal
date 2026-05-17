# RLS Test Matrix (generated)

Generated: 2026-05-17T00:13:35.653Z

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
| 20260516120000_v2_core_safety_additive.sql | — |
| 20260516120100_v2_multi_tenant.sql | — |
| 20260516120200_v2_liquidity.sql | — |
| 20260516120300_v2_kyc_moderation_bulk.sql | — |
| 20260516120400_v2_pgmq_matching.sql | — |

## Manual verification

- Run `RUN_RLS_INTEGRATION=1 npm run test:rls:live` when Supabase credentials available.
- Apply migration `20260516120000_admin_listing_security.sql` on production project.