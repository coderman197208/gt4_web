-- public.alarm_event definition

CREATE TABLE public.alarm_event (
	id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	message text NOT NULL,
	area varchar(100) NOT NULL DEFAULT '',
	occurred_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	acknowledged_at timestamptz NULL
);

CREATE INDEX alarm_event_occurred_at_id_idx
	ON public.alarm_event (occurred_at DESC, id DESC);

COMMENT ON TABLE public.alarm_event IS '报警事件';
COMMENT ON COLUMN public.alarm_event.message IS '报警信息';
COMMENT ON COLUMN public.alarm_event.area IS '报警区域，空值表示全厂';
COMMENT ON COLUMN public.alarm_event.occurred_at IS '报警发生时间';
COMMENT ON COLUMN public.alarm_event.acknowledged_at IS '报警确认时间';