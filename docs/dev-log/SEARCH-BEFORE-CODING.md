# 🔍 Search Before Coding

Trước khi bắt đầu code bất kỳ feature mới, hãy tra cứu xem đã có ai làm chưa.

## Cách 1: Search trong dev-log (Ctrl+Shift+F trong IDE)

```
docs/dev-log/features/<tên-feature>.md
docs/dev-log/decisions/<adr-xxx>.md
```

## Cách 2: Dùng PowerShell

```powershell
# Search features có từ khóa
cd D:\e-conomic
Get-ChildItem docs/dev-log -Recurse -Filter *.md | Select-String -Pattern "từ_khóa"

# Search toàn bộ codebase
Get-ChildItem -Recurse -Filter *.ts | Select-String -Pattern "từ_khóa"
```

## Cách 3: Dùng Git (nếu đã commit feature)

```bash
cd D:\e-conomic
git log --oneline --grep="từ_khóa"
```

## Khi tìm thấy

Nếu feature đã có trong dev-log:
- Đọc file để biết trạng thái, files ảnh hưởng, decisions
- Nếu ✅ Done — không cần code lại
- Nếu ⏳ In Progress / ⏳ Partial — tiếp tục từ đó
- Nếu status khác — đọc notes

## Khi không tìm thấy

Tạo file mới:
1. Copy `docs/dev-log/TEMPLATE.md` → `docs/dev-log/features/<feature-name>.md`
2. Cập nhật `docs/dev-log/INDEX.md`
