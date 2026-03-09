CRITICAL GAPS (P0/P1 Requirements)


    2. 

    3. Livestock Module - Missing Features (F-06)

    ┌────────────────────────────────────────────────┬────────────┬──────────────────────────────────────────────────────────────────┐
    │ PRD Requirement                                │ Status     │ Gap                                                              │
    ├────────────────────────────────────────────────┼────────────┼──────────────────────────────────────────────────────────────────┤
    │ Animal detail page (/dashboard/livestock/[id]) │ ✅ Exists  │ Route exists at livestock/[id]/page.tsx                          │
    │ Production summary chart                       │ ❌ Missing │ getProductionStats returns basic object, no Recharts integration │
    │ Health reminders surfacing in UI               │ ⚠️ Partial │ getHealthReminders exists, UI integration unclear                │
    │ Lineage display (parent/offspring)             │ ❌ Missing │ Schema supports it, no UI implementation                         │
    └────────────────────────────────────────────────┴────────────┴──────────────────────────────────────────────────────────────────┘


    4. Task Module - Missing Features (F-07)

    ┌────────────────────────────────────────────┬────────────┬────────────────────────────────────────────────────────────┐
    │ PRD Requirement                            │ Status     │ Gap                                                        │
    ├────────────────────────────────────────────┼────────────┼────────────────────────────────────────────────────────────┤
    │ RRULE parsing for recurrence               │ ❌ Missing │ Mock implementation adds 1 day, no real iCal RRULE parsing │
    │ Task sections (Overdue/Due Today/Upcoming) │ ❌ Missing │ getTasks has basic filters, no smart section logic         │
    │ Completion history view                    │ ❌ Missing │ Only last completion fetched                               │
    └────────────────────────────────────────────┴────────────┴────────────────────────────────────────────────────────────┘


    5. Resources Module - Missing Features (F-08)

    ┌──────────────────────────────────────┬────────────┬─────────────────────────────────────┐
    │ PRD Requirement                      │ Status     │ Gap                                 │
    ├──────────────────────────────────────┼────────────┼─────────────────────────────────────┤
    │ Consumption trend chart (Recharts)   │ ❌ Missing │ No chart implementation             │
    │ Low-stock alerts with thresholds     │ ❌ Missing │ No threshold storage or alert logic │
    │ Summary cards with trend calculation │ ⚠️ Partial │ trend hardcoded as 'stable'         │
    └──────────────────────────────────────┴────────────┴─────────────────────────────────────┘


    6. Weather Module - Missing Features (F-09)

    ┌────────────────────────────────┬────────────┬────────────────────────────────┐
    │ PRD Requirement                │ Status     │ Gap                            │
    ├────────────────────────────────┼────────────┼────────────────────────────────┤
    │ OpenWeatherMap API integration │ ❌ Missing │ No API key usage or auto-fetch │
    │ Frost alert banner             │ ❌ Missing │ No frost detection logic       │
    │ Temperature trend chart        │ ❌ Missing │ No Recharts integration        │
    │ Historical table pagination    │ ❌ Missing │ Simple take: 50 limit          │
    └────────────────────────────────┴────────────┴────────────────────────────────┘


    7. Preparedness Module - Missing Features (F-10)

    ┌───────────────────────────────┬────────────┬──────────────────────────────────────────────┐
    │ PRD Requirement               │ Status     │ Gap                                          │
    ├───────────────────────────────┼────────────┼──────────────────────────────────────────────┤
    │ Template cloning              │ ❌ Missing │ No cloneChecklist action                     │
    │ Drag-to-reorder (sortOrder)   │ ❌ Missing │ No reorder action                            │
    │ Templates cannot be completed │ ❌ Missing │ No validation preventing template completion │
    └───────────────────────────────┴────────────┴──────────────────────────────────────────────┘


    8. Settings Module - Missing Features (F-11)

    ┌──────────────────────────────┬────────────┬─────────────────────────────────────────┐
    │ PRD Requirement              │ Status     │ Gap                                     │
    ├──────────────────────────────┼────────────┼─────────────────────────────────────────┤
    │ Data export (JSON)           │ ❌ Missing │ No exportAllData action                 │
    │ Data import (JSON backup)    │ ❌ Missing │ No import functionality                 │
    │ Unit preference affecting UI │ ❌ Missing │ Setting exists but not applied globally │
    │ Notification preferences     │ ❌ Missing │ No preference storage/toggles           │
    └──────────────────────────────┴────────────┴─────────────────────────────────────────┘


    9. Notifications Module - Missing Features (F-12)

    ┌─────────────────────────────────────┬────────────┬───────────────────────────────────────────────┐
    │ PRD Requirement                     │ Status     │ Gap                                           │
    ├─────────────────────────────────────┼────────────┼───────────────────────────────────────────────┤
    │ Auto-generated from tasks (overdue) │ ❌ Missing │ Commented out in generateNotifications        │
    │ Auto-generated from weather (frost) │ ❌ Missing │ Not implemented                               │
    │ Sidebar badge with unread count     │ ⚠️ Partial │ getUnreadCount exists, UI integration unclear │
    └─────────────────────────────────────┴────────────┴───────────────────────────────────────────────┘


    10. Dashboard Module - Missing Features (F-02)

    ┌─────────────────────────────────────┬────────────┬───────────────────────────────────────────┐
    │ PRD Requirement                     │ Status     │ Gap                                       │
    ├─────────────────────────────────────┼────────────┼───────────────────────────────────────────┤
    │ Recent activity feed (cross-module) │ ❌ Missing │ No unified activity aggregation           │
    │ Alerts panel (all sources)          │ ⚠️ Partial │ Some logic exists, integration incomplete │
    │ Module stat cards with live counts  │ ⚠️ Partial │ Depends on UI implementation              │
    └─────────────────────────────────────┴────────────┴───────────────────────────────────────────┘

    ---

    MEDIUM GAPS (P2 Requirements)

    11. Offline-First (F-13)

    ┌─────────────────────────────────────┬────────────┬───────────────────────────────────────────────────┐
    │ PRD Requirement                     │ Status     │ Gap                                               │
    ├─────────────────────────────────────┼────────────┼───────────────────────────────────────────────────┤
    │ Read cache serving stale data       │ ⚠️ Partial │ getCachedData exists, integration pattern unclear │
    │ Write queue sync on reconnect       │ ⚠️ Partial │ syncQueue exists but untested                     │
    │ Last-write-wins conflict resolution │ ❌ Missing │ Not implemented in sync logic                     │
    └─────────────────────────────────────┴────────────┴───────────────────────────────────────────────────┘


    12. Testing Gaps
    Per PRD Testing Strategy section:

    ┌─────────────────────┬────────────────┬─────────────────┐
    │ Module              │ Test Status    │ Gap             │
    ├─────────────────────┼────────────────┼─────────────────┤
    │ Garden (F-04)       │ ❌ No tests    │ High priority   │
    │ Equipment (F-05)    │ ❌ No tests    │ High priority   │
    │ Livestock (F-06)    │ ❌ No tests    │ High priority   │
    │ Resources (F-08)    │ ⚠️ Basic tests │ Medium priority │
    │ Weather (F-09)      │ ⚠️ Basic tests │ Medium priority │
    │ Preparedness (F-10) │ ⚠️ Basic tests │ Medium priority │
    │ Offline Sync (F-13) │ ❌ No tests    │ Low priority    │
    └─────────────────────┴────────────────┴─────────────────┘


    13. Schema Discrepancies

    ┌──────────────────────────────┬────────────────────────────────┬──────────────────────────────────────────────────────────┐
    │ PRD Specification            │ Actual Schema                  │ Gap                                                      │
    ├──────────────────────────────┼────────────────────────────────┼──────────────────────────────────────────────────────────┤
    │ PostgreSQL arrays (String[]) │ SQLite JSON (String?)          │ Correct for SQLite but noted                             │
    │ Animal.isNeutered field      │ Missing in schema              │ Schema has sex but not isNeutered                        │
    │ Equipment.status enum value  │ out-of-service vs out-of-order │ Validation uses out-of-order, schema uses out-of-service │
    └──────────────────────────────┴────────────────────────────────┴──────────────────────────────────────────────────────────┘


    14. Missing Utility Functions
    Per PRD "Existing Utilities" table:
     - All listed utilities (cn, formatDate, daysUntil, pluralize) are ✅ implemented

    ---

    LOW GAPS (Polish/Documentation)

    15. CI/CD Pipeline
     - ❌ No GitHub Actions workflow
     - ❌ No automated lint/test on PR

    16. Data Export/Import
     - ❌ No JSON export functionality
     - ❌ No backup/restore workflow

    17. PRD Documentation Discrepancies

    ┌────────────────┬─────────────────────────────────────────────────────┐
    │ PRD States     │ Actual                                              │
    ├────────────────┼─────────────────────────────────────────────────────┤
    │ Next.js 14     │ Next.js 16.1.6                                      │
    │ PostgreSQL     │ SQLite (correct for self-hosted)                    │
    │ tRPC mentioned │ Not in dependencies (correct - uses Server Actions) │
    └────────────────┴─────────────────────────────────────────────────────┘

    ---

    SUMMARY BY MODULE


    ┌──────────────────────┬────────────┬───────────────────────────────────┐
    │ Module               │ Completion │ Critical Gaps                     │
    ├──────────────────────┼────────────┼───────────────────────────────────┤
    │ Storage (F-03)       │ ✅ ~95%    │ Minor                             │
    │ Tasks (F-07)         │ ⚠️ ~70%    │ RRULE parsing, smart sections     │
    │ Garden (F-04)        │ ⚠️ ~60%    │ Calendar view, companion warnings │
    │ Equipment (F-05)     │ ⚠️ ~70%    │ Maintenance history UI            │
    │ Livestock (F-06)     │ ⚠️ ~60%    │ Production charts, lineage UI     │
    │ Resources (F-08)     │ ⚠️ ~50%    │ Trend charts, low-stock alerts    │
    │ Weather (F-09)       │ ⚠️ ~40%    │ API integration, frost alerts     │
    │ Preparedness (F-10)  │ ⚠️ ~60%    │ Template cloning, reordering      │
    │ Settings (F-11)      │ ⚠️ ~50%    │ Export/import, unit preference    │
    │ Notifications (F-12) │ ⚠️ ~50%    │ Auto-generation from all sources  │
    │ Dashboard (F-02)     │ ⚠️ ~60%    │ Activity feed, alerts panel       │
    │ Offline (F-13)       │ ⚠️ ~60%    │ Conflict resolution               │
    └──────────────────────┴────────────┴───────────────────────────────────┘


    ---

    RECOMMENDED PRIORITY ORDER

     1. Task RRULE parsing - Blocks correct recurrence behavior
     2. Dashboard alerts panel - Core user visibility
     3. Garden calendar view - Key differentiator feature
     4. Settings export/import - Data portability requirement
     5. Livestock production charts - High-value visualization
     6. Weather frost alerts - Safety-critical feature
     7. CI/CD pipeline - Release confidence
     8. Test coverage for Phase 2/3 modules - Quality assurance