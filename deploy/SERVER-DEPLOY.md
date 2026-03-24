# Deploy LuxPads on your WHM / cPanel server

Checklist for **domain root**, **Apache 2.4**, **MySQL 8**, **Node 20.9+** (not 20.7 — Next.js 16 needs ≥ 20.9).

## 1. Prerequisites

- [ ] **Node.js 20.9+** and `npm` on the server (SSH as the cPanel user or root, depending on how you run the app).
- [ ] **MySQL**: create a database and user; grant `ALL` on that database to the user.
- [ ] **Apache modules** enabled: `proxy`, `proxy_http`, `headers` (WHM → EasyApache / module list, or your host’s equivalent).

## 2. Upload and unpack

From your laptop (or build the zip in the repo with `scripts/build-deploy-zip.sh`):

```bash
# On the server (paths are examples — use your account home + app folder)
cd ~
unzip -o luxpads-deploy.zip
cd luxpads
chmod +x deploy.sh
```

Use a directory **outside** `public_html` (e.g. `~/luxpads`) so the app code is not world-readable as static files.

## 3. Environment file

```bash
cp .env.example .env
nano .env   # or vi
```

Set at least:

| Variable | Example |
|----------|---------|
| `DATABASE_URL` | `mysql://DBUSER:DBPASS@127.0.0.1:3306/luxpads` |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` (must match how users open the site) |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `REQUIRE_LISTING_APPROVAL` | `true` or `false` |

## 4. Build the app (install, migrate, Next build)

```bash
./deploy.sh
```

This runs `npm ci`, `prisma migrate deploy`, and `next build`. Fix any errors (DB credentials, Node version) before continuing.

Ensure the user that will run Node **can write** `public/uploads` (e.g. `mkdir -p public/uploads && chmod 775 public/uploads` and correct ownership).

## 5. Run Node (pick one)

### A) Foreground (quick test)

```bash
./deploy.sh start
```

Listens on **127.0.0.1:3000** only. Visit only via Apache after step 6, or use `curl` from the server.

### B) Production (systemd)

1. Copy `deploy/luxpads.service.example` to `/etc/systemd/system/luxpads.service`.
2. Set `User=`, `Group=`, `WorkingDirectory=`, and `EnvironmentFile=` to your app path and `.env`.
3. Set `ExecStart=` to the full path of `npm` if needed (`which npm` as that user).
4. If the app should not use port `3000`, change `start:prod` in `package.json` **or** pass `PORT` (and match Apache `ProxyPass`).

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now luxpads
sudo systemctl status luxpads
```

## 6. Apache reverse proxy (cPanel / WHM)

`ProxyPass` cannot go in `.htaccess` for this setup. Use **per-domain userdata** includes.

1. Open **`deploy/apache-cpanel-whm.conf.example`** and follow the comments.
2. Create the two snippet files under:
   - `.../userdata/std/2_4/CPUSER/DOMAIN.com/luxpads-proxy.conf`
   - `.../userdata/ssl/2_4/CPUSER/DOMAIN.com/luxpads-proxy.conf`
3. Replace **`3000`** if your Node app uses another port.
4. Rebuild Apache (as **root**):

```bash
/usr/local/cpanel/scripts/rebuildhttpdconf && /usr/local/cpanel/scripts/restartsrv_httpd
```

The example keeps **`/.well-known`** on disk for **AutoSSL**.

## 7. Demo / sample listings (optional)

The repo includes **`deploy/luxpads-sample-data.sql`** — the same demo homes, users, and destinations as `npm run db:seed`.

**Warning: this deletes all existing users, listings, inquiries, and related rows** in that database, then inserts demo data. Use only on a fresh DB or after a backup.

```bash
# From the app directory on the server (adjust user, host, database name):
mysql -h 127.0.0.1 -u YOUR_DB_USER -p YOUR_DATABASE < deploy/luxpads-sample-data.sql
```

Demo logins (password **`LuxPads!demo123`** for all):

| Role   | Email              |
|--------|--------------------|
| Admin  | `admin@luxpads.co` |
| Owner  | `owner1@luxpads.co` (also owner2, owner3) |
| Renter | `renter@luxpads.co` |

Alternatively, from the app directory with Node: `npx prisma db seed` — same end result (the seed script also clears those tables before inserting).

To regenerate the `.sql` file after editing the script: `npm run db:sample-sql`.

**Homepage “Featured residences”:** the app prefers listings with `featured = 1`, then fills the row with other published homes so the section is not empty. If you want the four demo “spotlight” slugs marked featured in the database, run [`deploy/patch-demo-featured-flags.sql`](./patch-demo-featured-flags.sql) (optional).

## 8. After deploy

- [ ] Open `https://yourdomain.com` — login, listing, upload if you use local storage.
- [ ] **Updates:** upload a new zip (or `git pull`), then `./deploy.sh` again and restart Node (`systemctl restart luxpads` or restart your process manager).

## Reference files in this repo

| File | Purpose |
|------|---------|
| `deploy.sh` | `./deploy.sh` = build; `./deploy.sh start` = run |
| `deploy/apache-cpanel-whm.conf.example` | WHM userdata snippets |
| `deploy/luxpads.service.example` | systemd unit |
| `deploy/apache-luxpads.conf.example` | Generic full vhost (non–cPanel) |
| `deploy/luxpads-sample-data.sql` | Demo listings + users (MySQL import; destructive) |

Docker-based deploy is optional: `./deploy.sh docker up`.
