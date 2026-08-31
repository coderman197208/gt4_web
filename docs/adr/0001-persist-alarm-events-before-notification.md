# Persist alarm events before notification

Alarm events are immutable records persisted by the C++ publisher in PostgreSQL before any notification is sent. Redis carries only transient change signals, and Web clients fetch the authoritative records through HTTP; this replaces the previous Redis-stored event model so alarm history survives subscriber downtime and notification loss, while periodic refresh provides eventual consistency.
