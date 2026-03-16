# NOC Shift Scheduler (MVP)

Simple web platform for weekly NOC planning:

- Team members can block shifts they are unavailable for.
- Manager can generate a weekly draft schedule with an AI-helper style fair assignment.
- Manager can manually override every generated assignment.

## Run locally

```bash
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

## How it works

- 7 days × 3 shifts per day:
  - 07:00-15:00
  - 15:00-23:00
  - 23:00-07:00
- Availability table is per selected employee.
- Draft generator chooses the available teammate with the **lowest current assignment count** (fairness heuristic).
- If nobody is available for a shift, it is marked as `Unassigned`.
