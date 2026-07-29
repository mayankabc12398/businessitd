-- ============================================================================
-- Smart HIMS PMO — Rollback (MySQL 8)
-- Drops every object created by schema.sql, children before parents.
-- FK checks disabled to make the run order-independent and idempotent.
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Dashboard content
DROP TABLE IF EXISTS upcoming_events;
DROP TABLE IF EXISTS activity_feed;
DROP TABLE IF EXISTS notifications;

-- SFR children
DROP TABLE IF EXISTS feature_approvals;
DROP TABLE IF EXISTS feature_kb_docs;
DROP TABLE IF EXISTS feature_client_adoption;
DROP TABLE IF EXISTS feature_tests;
DROP TABLE IF EXISTS feature_screen_changes;
DROP TABLE IF EXISTS feature_impact;
DROP TABLE IF EXISTS feature_workflow_steps;
DROP TABLE IF EXISTS feature_workflows;
DROP TABLE IF EXISTS feature_dev_details;
DROP TABLE IF EXISTS feature_technical_analysis;
DROP TABLE IF EXISTS feature_business_analysis;
DROP TABLE IF EXISTS feature_applicable_segments;
DROP TABLE IF EXISTS features;

-- SIR children
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS developer_notes;
DROP TABLE IF EXISTS version_history;
DROP TABLE IF EXISTS integration_documents;
DROP TABLE IF EXISTS integration_test_cases;
DROP TABLE IF EXISTS client_implementations;
DROP TABLE IF EXISTS integration_screens;
DROP TABLE IF EXISTS source_code;
DROP TABLE IF EXISTS db_changes;
DROP TABLE IF EXISTS hims_changes;
DROP TABLE IF EXISTS api_payloads;
DROP TABLE IF EXISTS apis;
DROP TABLE IF EXISTS process_flow_steps;
DROP TABLE IF EXISTS process_flows;
DROP TABLE IF EXISTS integrations;

-- Standalone
DROP TABLE IF EXISTS hospital_users;
DROP TABLE IF EXISTS activity_modules;
DROP TABLE IF EXISTS activity_schedule;

-- PMO delivery / governance
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS signoffs;
DROP TABLE IF EXISTS risks;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS final_golive;
DROP TABLE IF EXISTS parallel_golive;
DROP TABLE IF EXISTS live_imports;
DROP TABLE IF EXISTS golive_readiness_items;
DROP TABLE IF EXISTS golive_readiness;
DROP TABLE IF EXISTS trainings;
DROP TABLE IF EXISTS bugs;
DROP TABLE IF EXISTS uat_cases;
DROP TABLE IF EXISTS development_items;
DROP TABLE IF EXISTS master_data_records;
DROP TABLE IF EXISTS requirements;
DROP TABLE IF EXISTS srs_sessions;

-- PMO core
DROP TABLE IF EXISTS project_milestones;
DROP TABLE IF EXISTS project_interfaces;
DROP TABLE IF EXISTS project_modules;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS client_escalations;
DROP TABLE IF EXISTS client_contacts;
DROP TABLE IF EXISTS clients;

-- Lookups (SFR)
DROP TABLE IF EXISTS kb_doc_types;
DROP TABLE IF EXISTS workflow_steps_sfr;
DROP TABLE IF EXISTS applicable_segments;
DROP TABLE IF EXISTS feature_statuses;
DROP TABLE IF EXISTS feature_categories;
DROP TABLE IF EXISTS feature_modules;
-- Lookups (SIR)
DROP TABLE IF EXISTS workflow_steps_sir;
DROP TABLE IF EXISTS sir_doc_types;
DROP TABLE IF EXISTS auth_types;
DROP TABLE IF EXISTS http_methods;
DROP TABLE IF EXISTS integration_statuses;
DROP TABLE IF EXISTS integration_categories;
-- Lookups (PMO)
DROP TABLE IF EXISTS notification_templates;
DROP TABLE IF EXISTS master_data_items;
DROP TABLE IF EXISTS bug_categories;
DROP TABLE IF EXISTS signoff_milestones;
DROP TABLE IF EXISTS doc_categories;
DROP TABLE IF EXISTS training_types;
DROP TABLE IF EXISTS risk_types;
DROP TABLE IF EXISTS issue_types;
DROP TABLE IF EXISTS team_departments;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS interfaces;
DROP TABLE IF EXISTS hospital_departments;
DROP TABLE IF EXISTS hims_modules;
DROP TABLE IF EXISTS lifecycle_stages;
DROP TABLE IF EXISTS project_integration_types;
DROP TABLE IF EXISTS hospital_types;
DROP TABLE IF EXISTS implementation_types;
DROP TABLE IF EXISTS project_categories;
DROP TABLE IF EXISTS project_statuses;
DROP TABLE IF EXISTS health_statuses;
DROP TABLE IF EXISTS severity_levels;
DROP TABLE IF EXISTS countries;
DROP TABLE IF EXISTS currencies;

SET FOREIGN_KEY_CHECKS = 1;
