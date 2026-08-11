# Bhavani Homemade Spices — Database Backup & Recovery Procedures

## 1. Backup Schedule & Strategy
* **Automated Daily Backups:** Full PostgreSQL database dump performed every 24 hours at 02:00 UTC.
* **Point-in-Time Recovery (PITR):** Supabase WAL (Write-Ahead Logging) archiving enabled with 7-day retention.
* **Storage Location:** Off-site encrypted S3 bucket storage.

---

## 2. Manual Backup Execution
To create an immediate database snapshot:
```bash
pg_dump -h akumpcejcbtdmjwrbfzj.supabase.co -U postgres -d postgres -F c -b -v -f "bhavani_backup_$(date +%Y%m%d_%H%M%S).dump"
```

---

## 3. Disaster Recovery Restoration Procedure
1. Provision a new PostgreSQL instance or reset target database.
2. Apply full database dump:
   ```bash
   pg_restore -h target-host -U postgres -d postgres -v "bhavani_backup_target.dump"
   ```
3. Run verification test suite (`npm test`) to confirm schema and data integrity.
