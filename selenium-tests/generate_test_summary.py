"""
Script untuk generate tabel ringkasan semua test Selenium
Hasil berupa file Markdown dan HTML
"""

import os
import re
from pathlib import Path

# Folder selenium tests
TEST_DIR = Path(__file__).parent

def extract_test_info(filepath):
    """Extract informasi dari file test"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract docstring (deskripsi test)
    docstring_match = re.search(r'"""(.*?)"""', content, re.DOTALL)
    description = docstring_match.group(1).strip() if docstring_match else "No description"
    description = description.split('\n')[0]  # Ambil baris pertama saja
    
    # Hitung jumlah STEP
    steps = len(re.findall(r'STEP \d+:', content, re.IGNORECASE))
    
    # Extract credentials/role
    role_match = re.search(r'ROLE\s*=\s*["\'](.+?)["\']', content)
    role = role_match.group(1) if role_match else "N/A"
    
    # Extract email
    email_match = re.search(r'EMAIL(?:_\w+)?\s*=\s*["\'](.+?)["\']', content)
    email = email_match.group(1) if email_match else "N/A"
    
    # Kategori berdasarkan nama file
    filename = filepath.name
    if 'p4m' in filename.lower() or 'review' in filename.lower():
        category = "P4M/Review"
    elif 'lkps' in filename.lower():
        category = "LKPS"
    elif 'led' in filename.lower():
        category = "LED"
    elif 'export' in filename.lower():
        category = "Export"
    elif 'matriks' in filename.lower():
        category = "Matriks"
    elif 'manajemen' in filename.lower() or 'akun' in filename.lower():
        category = "Manajemen Akun"
    else:
        category = "General"
    
    return {
        'filename': filename,
        'description': description,
        'steps': steps,
        'role': role,
        'email': email,
        'category': category
    }

def generate_markdown_table(tests):
    """Generate tabel Markdown"""
    markdown = "# 📊 Ringkasan Test Selenium\n\n"
    markdown += f"**Total Test:** {len(tests)}\n\n"
    
    # Group by category
    categories = {}
    for test in tests:
        cat = test['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(test)
    
    # Statistik per kategori
    markdown += "## 📈 Statistik per Kategori\n\n"
    markdown += "| Kategori | Jumlah Test | Total Steps |\n"
    markdown += "|----------|-------------|-------------|\n"
    for cat, items in sorted(categories.items()):
        total_steps = sum(item['steps'] for item in items)
        markdown += f"| {cat} | {len(items)} | {total_steps} |\n"
    
    markdown += "\n---\n\n"
    
    # Tabel per kategori
    for cat, items in sorted(categories.items()):
        markdown += f"## 🔷 {cat}\n\n"
        markdown += "| No | Nama File | Deskripsi | Steps | Role | Email |\n"
        markdown += "|----|-----------|-----------|-------|------|-------|\n"
        
        for i, test in enumerate(sorted(items, key=lambda x: x['filename']), 1):
            desc = test['description'][:60] + "..." if len(test['description']) > 60 else test['description']
            email = test['email'][:30] + "..." if len(test['email']) > 30 else test['email']
            markdown += f"| {i} | `{test['filename']}` | {desc} | {test['steps']} | {test['role']} | {email} |\n"
        
        markdown += "\n"
    
    # Tabel lengkap
    markdown += "## 📋 Daftar Lengkap (Alphabetical)\n\n"
    markdown += "| No | Kategori | Nama File | Deskripsi | Steps | Role | Email |\n"
    markdown += "|----|----------|-----------|-----------|-------|------|-------|\n"
    
    for i, test in enumerate(sorted(tests, key=lambda x: x['filename']), 1):
        desc = test['description'][:60] + "..." if len(test['description']) > 60 else test['description']
        email = test['email'][:30] + "..." if len(test['email']) > 30 else test['email']
        markdown += f"| {i} | {test['category']} | `{test['filename']}` | {desc} | {test['steps']} | {test['role']} | {email} |\n"
    
    return markdown

def generate_html_table(tests):
    """Generate tabel HTML dengan styling"""
    html = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ringkasan Test Selenium</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            padding: 30px;
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .stat-card h3 {
            font-size: 2em;
            margin-bottom: 5px;
        }
        .stat-card p {
            font-size: 0.9em;
            opacity: 0.9;
        }
        .category-section {
            margin-bottom: 40px;
        }
        .category-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 1.3em;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .category-badge {
            background: rgba(255,255,255,0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.8em;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        thead {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        tr:hover {
            background: #f8f9ff;
        }
        .filename {
            font-family: 'Courier New', monospace;
            background: #f0f0f0;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.9em;
            color: #e74c3c;
        }
        .steps-badge {
            background: #3498db;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
            display: inline-block;
        }
        .role-badge {
            background: #2ecc71;
            color: white;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.85em;
            font-weight: 500;
        }
        .email {
            color: #7f8c8d;
            font-size: 0.9em;
        }
        .search-box {
            margin-bottom: 20px;
            position: relative;
        }
        .search-box input {
            width: 100%;
            padding: 15px 20px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s;
        }
        .search-box input:focus {
            outline: none;
            border-color: #667eea;
        }
        .footer {
            text-align: center;
            color: #999;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Ringkasan Test Selenium</h1>
        <p class="subtitle">Sistem Akreditasi Polibatam</p>
        
        <div class="stats">
"""
    
    # Statistik
    total_tests = len(tests)
    total_steps = sum(test['steps'] for test in tests)
    categories = set(test['category'] for test in tests)
    
    html += f"""
            <div class="stat-card">
                <h3>{total_tests}</h3>
                <p>Total Test</p>
            </div>
            <div class="stat-card">
                <h3>{total_steps}</h3>
                <p>Total Steps</p>
            </div>
            <div class="stat-card">
                <h3>{len(categories)}</h3>
                <p>Kategori</p>
            </div>
            <div class="stat-card">
                <h3>{total_steps // total_tests if total_tests > 0 else 0}</h3>
                <p>Avg Steps/Test</p>
            </div>
        </div>
        
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="🔍 Cari test..." onkeyup="searchTable()">
        </div>
"""
    
    # Group by category
    category_groups = {}
    for test in tests:
        cat = test['category']
        if cat not in category_groups:
            category_groups[cat] = []
        category_groups[cat].append(test)
    
    # Tabel per kategori
    for cat, items in sorted(category_groups.items()):
        html += f"""
        <div class="category-section">
            <div class="category-header">
                <span>🔷 {cat}</span>
                <span class="category-badge">{len(items)} test</span>
            </div>
            <table class="test-table">
                <thead>
                    <tr>
                        <th style="width: 5%">No</th>
                        <th style="width: 25%">Nama File</th>
                        <th style="width: 35%">Deskripsi</th>
                        <th style="width: 10%">Steps</th>
                        <th style="width: 12%">Role</th>
                        <th style="width: 13%">Email</th>
                    </tr>
                </thead>
                <tbody>
"""
        
        for i, test in enumerate(sorted(items, key=lambda x: x['filename']), 1):
            html += f"""
                    <tr>
                        <td>{i}</td>
                        <td><span class="filename">{test['filename']}</span></td>
                        <td>{test['description']}</td>
                        <td><span class="steps-badge">{test['steps']} steps</span></td>
                        <td><span class="role-badge">{test['role']}</span></td>
                        <td><span class="email">{test['email'][:30]}{'...' if len(test['email']) > 30 else ''}</span></td>
                    </tr>
"""
        
        html += """
                </tbody>
            </table>
        </div>
"""
    
    html += """
        <div class="footer">
            <p>Generated by generate_test_summary.py</p>
            <p>Sistem Akreditasi Polibatam - Selenium Tests</p>
        </div>
    </div>
    
    <script>
        function searchTable() {
            const input = document.getElementById('searchInput');
            const filter = input.value.toLowerCase();
            const tables = document.querySelectorAll('.test-table');
            
            tables.forEach(table => {
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    
                    if (text.includes(filter)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        }
    </script>
</body>
</html>
"""
    
    return html

def main():
    """Main function"""
    print("="*70)
    print("  📊 GENERATE TABEL RINGKASAN TEST SELENIUM")
    print("="*70)
    
    # Scan semua file test
    print("\n🔍 Scanning test files...")
    test_files = list(TEST_DIR.glob("test_*.py"))
    
    if not test_files:
        print("❌ Tidak ada file test ditemukan!")
        return
    
    print(f"✅ Ditemukan {len(test_files)} file test\n")
    
    # Extract info dari setiap test
    tests = []
    for filepath in sorted(test_files):
        print(f"   📄 Processing: {filepath.name}")
        try:
            info = extract_test_info(filepath)
            tests.append(info)
        except Exception as e:
            print(f"      ⚠️  Error: {str(e)}")
    
    print(f"\n✅ Berhasil extract {len(tests)} test\n")
    
    # Generate Markdown
    print("📝 Generating Markdown table...")
    markdown = generate_markdown_table(tests)
    md_file = TEST_DIR / "TEST_SUMMARY.md"
    with open(md_file, 'w', encoding='utf-8') as f:
        f.write(markdown)
    print(f"   ✅ Saved: {md_file.name}")
    
    # Generate HTML
    print("🌐 Generating HTML table...")
    html = generate_html_table(tests)
    html_file = TEST_DIR / "TEST_SUMMARY.html"
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"   ✅ Saved: {html_file.name}")
    
    print("\n" + "="*70)
    print("✅ SELESAI!")
    print("="*70)
    print(f"\n📁 Output files:")
    print(f"   • {md_file.name} - Markdown format")
    print(f"   • {html_file.name} - HTML format (buka di browser)")
    print(f"\n💡 Buka {html_file.name} di browser untuk melihat tabel interaktif")

if __name__ == "__main__":
    main()
