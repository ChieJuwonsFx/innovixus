create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into app_settings (key, value) values ('ig_access_token', '')
on conflict (key) do nothing;
