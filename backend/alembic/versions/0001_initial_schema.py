"""initial schema"""
from typing import Sequence, Union
from alembic import op
revision='0001_initial_schema'; down_revision=None; branch_labels=None; depends_on=None
SCHEMA_SQL = '''
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE profilerole AS ENUM ('super_admin','business_owner','staff');
CREATE TYPE businessstatus AS ENUM ('active','pending','paused','archived');
CREATE TYPE memberrole AS ENUM ('owner','staff');
CREATE TYPE leadstatus AS ENUM ('new','contacted','booked','follow_up','lost','archived');
CREATE TYPE messagedirection AS ENUM ('inbound','outbound','internal');
CREATE TYPE messagechannel AS ENUM ('form','email','system');
CREATE TYPE messagetype AS ENUM ('customer_message','auto_reply','ai_draft','owner_reply','follow_up');
CREATE TYPE emailstatus AS ENUM ('queued','sent','failed');
CREATE TYPE followupstatus AS ENUM ('scheduled','sent','canceled','failed');
CREATE TYPE aioutputtype AS ENUM ('lead_summary','suggested_reply','dashboard_insight');
CREATE TABLE profiles (id uuid PRIMARY KEY, email varchar(320) UNIQUE NOT NULL, full_name varchar(160), role profilerole NOT NULL DEFAULT 'business_owner', created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE businesses (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(180) NOT NULL, slug varchar(220) UNIQUE NOT NULL, industry varchar(120), phone varchar(60), contact_email varchar(320), address varchar(320), logo_url varchar(600), brand_color varchar(20) NOT NULL DEFAULT '#2563EB', status businessstatus NOT NULL DEFAULT 'pending', created_by uuid, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE business_members (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, role memberrole NOT NULL DEFAULT 'owner', is_active boolean NOT NULL DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(), CONSTRAINT uq_business_members_business_user UNIQUE (business_id,user_id));
CREATE TABLE forms (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, slug varchar(220) UNIQUE NOT NULL, title varchar(180) NOT NULL DEFAULT 'Request a Quote', description varchar(600), success_message varchar(600) NOT NULL DEFAULT 'Thanks. Your request has been received.', is_active boolean NOT NULL DEFAULT true, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE leads (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, form_id uuid REFERENCES forms(id) ON DELETE SET NULL, customer_name varchar(160) NOT NULL, customer_email varchar(320), customer_phone varchar(80), service_needed varchar(180), preferred_time varchar(180), message text, source varchar(80) NOT NULL DEFAULT 'public_form', status leadstatus NOT NULL DEFAULT 'new', estimated_value numeric(10,2), custom_fields jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE messages (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE, direction messagedirection NOT NULL, channel messagechannel NOT NULL DEFAULT 'email', message_type messagetype NOT NULL DEFAULT 'customer_message', subject varchar(240), content text NOT NULL, external_id varchar(240), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE follow_ups (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE, lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE, scheduled_at timestamptz NOT NULL, status followupstatus NOT NULL DEFAULT 'scheduled', subject varchar(240), content text, sent_at timestamptz, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE email_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid REFERENCES businesses(id) ON DELETE SET NULL, lead_id uuid REFERENCES leads(id) ON DELETE SET NULL, to_email varchar(320) NOT NULL, from_email varchar(320) NOT NULL, subject varchar(240) NOT NULL, provider varchar(80) NOT NULL DEFAULT 'resend', provider_message_id varchar(240), status emailstatus NOT NULL DEFAULT 'queued', error_message text, metadata_json jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE ai_outputs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid REFERENCES businesses(id) ON DELETE CASCADE, lead_id uuid REFERENCES leads(id) ON DELETE CASCADE, output_type aioutputtype NOT NULL, model varchar(120) NOT NULL, prompt_version varchar(80) NOT NULL DEFAULT 'v1', raw_output text, structured_output jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE TABLE audit_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL, business_id uuid REFERENCES businesses(id) ON DELETE SET NULL, action varchar(120) NOT NULL, entity_type varchar(120), entity_id varchar(120), details jsonb, created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now());
CREATE INDEX ix_businesses_slug ON businesses(slug); CREATE INDEX ix_leads_business_status_created ON leads(business_id,status,created_at); CREATE INDEX ix_messages_lead_created ON messages(lead_id,created_at); CREATE INDEX ix_followups_due ON follow_ups(status,scheduled_at);
'''
def upgrade(): op.execute(SCHEMA_SQL)
def downgrade():
    op.execute('DROP TABLE IF EXISTS audit_logs, ai_outputs, email_events, follow_ups, messages, leads, forms, business_members, businesses, profiles CASCADE')
    for t in ['aioutputtype','followupstatus','emailstatus','messagetype','messagechannel','messagedirection','leadstatus','memberrole','businessstatus','profilerole']: op.execute(f'DROP TYPE IF EXISTS {t} CASCADE')
