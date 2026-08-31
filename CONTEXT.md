# GT4 Web Domain

GT4 Web presents production information and operator workflows for the GT4 steel-pipe line. This glossary defines the shared language used by its alarm capabilities and upstream alarm publishers.

## Alarms

**Alarm Event**:
An immutable record that reports one abnormal occurrence. Repeated reports create distinct alarm events.
_Avoid_: Alarm message, active alarm

**Acknowledgement**:
An operator action recording that an alarm event has been seen. It does not mean that the abnormal condition has recovered or been cleared.
_Avoid_: Confirmation, clearance, recovery

**Alarm Area**:
The optional production area associated with an alarm event. An event without an alarm area is plant-wide and visible regardless of area.
_Avoid_: Zone, user area

**Alarm Change Notification**:
A transient signal indicating that persisted alarm data has changed and should be fetched again. It is not the alarm event or its durable record.
_Avoid_: Alarm event, alarm payload
