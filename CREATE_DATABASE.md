# Create PostgreSQL Database

## Option 1: Using pgAdmin (GUI)

1. Open **pgAdmin**
2. Connect to your PostgreSQL server (usually localhost)
3. Right-click on **Databases**
4. Select **Create** → **Database**
5. Enter database name: `doppler`
6. Click **Save**

## Option 2: Using Command Line

Open Command Prompt or PowerShell and run:

```bash
psql -U postgres
```

Enter your PostgreSQL password, then run:

```sql
CREATE DATABASE doppler;
\q
```

## Option 3: Using SQL Shell (psql)

1. Open **SQL Shell (psql)** from Start Menu
2. Press Enter for default values (Server, Database, Port, Username)
3. Enter your password
4. Run:
```sql
CREATE DATABASE doppler;
```

## Verify Database Created

```sql
\l
```

You should see `doppler` in the list.

---

## Next: Update .env File

After creating the database, update `backend/.env`:

**Find your PostgreSQL password:**
- It's the password you set during PostgreSQL installation
- Default username is usually `postgres`

**Edit `backend/.env`:**
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/doppler
```

**Example:**
If your password is `admin123`:
```
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/doppler
```

**Common passwords to try:**
- postgres
- admin
- root
- (the password you set during installation)
