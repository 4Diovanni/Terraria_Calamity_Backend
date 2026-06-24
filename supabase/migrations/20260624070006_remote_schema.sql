SET check_function_bodies = false;
DROP EXTENSION pg_net;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE UPDATE ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE UPDATE ON SEQUENCES FROM authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public REVOKE UPDATE ON SEQUENCES FROM service_role;
CREATE SEQUENCE public.weapons_id_seq;
CREATE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;
CREATE TABLE public.flyway_schema_history (installed_rank integer NOT NULL, version character varying(50), description character varying(200) NOT NULL, type character varying(20) NOT NULL, script character varying(1000) NOT NULL, checksum integer, installed_by character varying(100) NOT NULL, installed_on timestamp without time zone DEFAULT now() NOT NULL, execution_time integer NOT NULL, success boolean NOT NULL);
ALTER TABLE public.flyway_schema_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flyway_schema_history ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.flyway_schema_history TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.flyway_schema_history TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.flyway_schema_history TO service_role;
CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history (success);
CREATE TABLE public.weapons (id bigint DEFAULT nextval('public.weapons_id_seq'::regclass) NOT NULL, name character varying(100) NOT NULL, weapon_class character varying(50) NOT NULL, element character varying(50) NOT NULL, base_damage integer NOT NULL, critical_chance integer NOT NULL, attacks_per_turn double precision NOT NULL, range integer NOT NULL, rarity integer NOT NULL, price integer NOT NULL, quality integer NOT NULL, abilities text, description text, image_url character varying(500), created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL);
ALTER SEQUENCE public.weapons_id_seq OWNED BY public.weapons.id;
ALTER TABLE public.weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weapons ADD CONSTRAINT weapons_critical_chance_check CHECK (critical_chance >= 1 AND critical_chance <= 20);
ALTER TABLE public.weapons ADD CONSTRAINT weapons_pkey PRIMARY KEY (id);
ALTER TABLE public.weapons ADD CONSTRAINT weapons_quality_check CHECK (quality >= 0 AND quality <= 10);
ALTER TABLE public.weapons ADD CONSTRAINT weapons_rarity_check CHECK (rarity >= '-1'::integer AND rarity <= 17);
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.weapons TO anon;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.weapons TO authenticated;
GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON public.weapons TO service_role;
CREATE INDEX idx_weapon_element ON public.weapons (element);
CREATE INDEX idx_weapon_rarity ON public.weapons (rarity);
CREATE INDEX idx_weapon_name ON public.weapons (name);
CREATE INDEX idx_weapon_class ON public.weapons (weapon_class);
CREATE EVENT TRIGGER ensure_rls ON ddl_command_end WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO') EXECUTE FUNCTION public.rls_auto_enable();
