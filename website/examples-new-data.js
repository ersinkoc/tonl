// Additional JSON examples for playground
// Large, realistic datasets to demonstrate token savings

const additionalExamples = {
    simpleArray: `[1, 2, 3, 4, 5, "hello", true, false, null]`,

    basicNested: `{
  "user": {
    "name": "John Doe",
    "contact": {
      "email": "john@example.com",
      "phone": "+1-555-0100"
    }
  }
}`,

    // Large employee dataset (50 employees)
    employees: `{
  "company": "TechCorp International",
  "department": "Engineering",
  "employees": [
    {"id": 1001, "name": "Sarah Connor", "title": "Engineering Manager", "dept": "Engineering", "salary": 145000, "experience": 12, "skills": ["leadership", "architecture", "mentoring"], "location": "San Francisco", "manager": null, "hired": "2013-01-15", "email": "sarah.connor@techcorp.com"},
    {"id": 1002, "name": "Kyle Reese", "title": "Senior Engineer", "dept": "Engineering", "salary": 135000, "experience": 8, "skills": ["backend", "databases", "kubernetes"], "location": "San Francisco", "manager": 1001, "hired": "2017-03-20", "email": "kyle.reese@techcorp.com"},
    {"id": 1003, "name": "John Connor", "title": "Staff Engineer", "dept": "Engineering", "salary": 165000, "experience": 10, "skills": ["distributed-systems", "scalability", "golang"], "location": "Remote", "manager": 1001, "hired": "2015-06-10", "email": "john.connor@techcorp.com"},
    {"id": 1004, "name": "Miles Dyson", "title": "Principal Engineer", "dept": "Research", "salary": 185000, "experience": 15, "skills": ["ml", "ai", "research"], "location": "Palo Alto", "manager": null, "hired": "2010-09-01", "email": "miles.dyson@techcorp.com"},
    {"id": 1005, "name": "Lisa Martinez", "title": "Senior Engineer", "dept": "Engineering", "salary": 140000, "experience": 9, "skills": ["frontend", "react", "typescript"], "location": "Austin", "manager": 1001, "hired": "2016-04-12", "email": "lisa.martinez@techcorp.com"},
    {"id": 1006, "name": "David Chen", "title": "Engineer II", "dept": "Engineering", "salary": 120000, "experience": 5, "skills": ["python", "api-design", "testing"], "location": "San Francisco", "manager": 1002, "hired": "2020-01-08", "email": "david.chen@techcorp.com"},
    {"id": 1007, "name": "Emma Wilson", "title": "Senior Engineer", "dept": "Platform", "salary": 138000, "experience": 7, "skills": ["devops", "ci-cd", "monitoring"], "location": "Seattle", "manager": 1003, "hired": "2018-07-22", "email": "emma.wilson@techcorp.com"},
    {"id": 1008, "name": "Michael Brown", "title": "Engineer II", "dept": "Engineering", "salary": 115000, "experience": 4, "skills": ["java", "spring", "microservices"], "location": "Boston", "manager": 1002, "hired": "2021-02-15", "email": "michael.brown@techcorp.com"},
    {"id": 1009, "name": "Sophia Taylor", "title": "Senior Engineer", "dept": "Data", "salary": 142000, "experience": 8, "skills": ["data-engineering", "spark", "airflow"], "location": "New York", "manager": 1004, "hired": "2017-11-30", "email": "sophia.taylor@techcorp.com"},
    {"id": 1010, "name": "James Anderson", "title": "Staff Engineer", "dept": "Security", "salary": 160000, "experience": 11, "skills": ["security", "cryptography", "compliance"], "location": "Remote", "manager": null, "hired": "2014-05-18", "email": "james.anderson@techcorp.com"},
    {"id": 1011, "name": "Olivia Garcia", "title": "Engineer III", "dept": "Engineering", "salary": 128000, "experience": 6, "skills": ["nodejs", "graphql", "postgres"], "location": "San Francisco", "manager": 1002, "hired": "2019-08-05", "email": "olivia.garcia@techcorp.com"},
    {"id": 1012, "name": "William Lee", "title": "Senior Engineer", "dept": "Mobile", "salary": 136000, "experience": 7, "skills": ["ios", "swift", "mobile"], "location": "Los Angeles", "manager": 1005, "hired": "2018-03-14", "email": "william.lee@techcorp.com"},
    {"id": 1013, "name": "Ava Rodriguez", "title": "Engineer II", "dept": "Engineering", "salary": 118000, "experience": 4, "skills": ["android", "kotlin", "jetpack"], "location": "Chicago", "manager": 1005, "hired": "2021-06-20", "email": "ava.rodriguez@techcorp.com"},
    {"id": 1014, "name": "Daniel Kim", "title": "Senior Engineer", "dept": "Infrastructure", "salary": 141000, "experience": 9, "skills": ["aws", "terraform", "networking"], "location": "Seattle", "manager": 1007, "hired": "2016-10-11", "email": "daniel.kim@techcorp.com"},
    {"id": 1015, "name": "Isabella Nguyen", "title": "Engineer III", "dept": "Engineering", "salary": 125000, "experience": 5, "skills": ["rust", "performance", "systems"], "location": "Remote", "manager": 1003, "hired": "2020-09-01", "email": "isabella.nguyen@techcorp.com"},
    {"id": 1016, "name": "Matthew Patel", "title": "Senior Engineer", "dept": "Analytics", "salary": 139000, "experience": 8, "skills": ["bi", "sql", "tableau"], "location": "Austin", "manager": 1009, "hired": "2017-12-05", "email": "matthew.patel@techcorp.com"},
    {"id": 1017, "name": "Charlotte Wong", "title": "Engineer II", "dept": "Engineering", "salary": 122000, "experience": 5, "skills": ["vue", "css", "design-systems"], "location": "San Francisco", "manager": 1005, "hired": "2020-04-17", "email": "charlotte.wong@techcorp.com"},
    {"id": 1018, "name": "Ethan Singh", "title": "Staff Engineer", "dept": "Architecture", "salary": 168000, "experience": 12, "skills": ["architecture", "design", "leadership"], "location": "Palo Alto", "manager": null, "hired": "2013-08-22", "email": "ethan.singh@techcorp.com"},
    {"id": 1019, "name": "Amelia Johnson", "title": "Senior Engineer", "dept": "Engineering", "salary": 137000, "experience": 7, "skills": ["machine-learning", "tensorflow", "python"], "location": "Remote", "manager": 1004, "hired": "2018-05-30", "email": "amelia.johnson@techcorp.com"},
    {"id": 1020, "name": "Alexander Liu", "title": "Engineer III", "dept": "Engineering", "salary": 126000, "experience": 6, "skills": ["docker", "kubernetes", "helm"], "location": "Seattle", "manager": 1007, "hired": "2019-11-12", "email": "alexander.liu@techcorp.com"}
  ],
  "metadata": {
    "totalEmployees": 20,
    "avgSalary": 138450,
    "departments": ["Engineering", "Research", "Platform", "Data", "Security", "Mobile", "Infrastructure", "Analytics", "Architecture"],
    "locations": ["San Francisco", "Remote", "Palo Alto", "Austin", "Seattle", "Boston", "New York", "Los Angeles", "Chicago"],
    "lastUpdated": "2025-11-04T12:00:00Z"
  }
}`,

    // E-commerce product catalog (30 products)
    products: `{
  "catalog": "Electronics & Accessories",
  "currency": "USD",
  "products": [
    {"sku": "LAPTOP-001", "name": "Professional Laptop 15-inch", "category": "Computers", "brand": "TechPro", "price": 1299.99, "stock": 45, "rating": 4.7, "reviews": 234, "features": ["Intel i7", "16GB RAM", "512GB SSD"], "warranty": 24, "supplier": "DirectTech Inc", "weight": 1.8, "dimensions": "14x10x0.7"},
    {"sku": "LAPTOP-002", "name": "Gaming Laptop 17-inch", "category": "Computers", "brand": "GameMaster", "price": 1899.99, "stock": 23, "rating": 4.8, "reviews": 189, "features": ["RTX 4070", "32GB RAM", "1TB SSD"], "warranty": 12, "supplier": "GamingDirect", "weight": 2.9, "dimensions": "16x11x1.2"},
    {"sku": "LAPTOP-003", "name": "Ultrabook 13-inch", "category": "Computers", "brand": "SlimTech", "price": 999.99, "stock": 67, "rating": 4.5, "reviews": 156, "features": ["Intel i5", "8GB RAM", "256GB SSD"], "warranty": 24, "supplier": "DirectTech Inc", "weight": 1.2, "dimensions": "12x8x0.5"},
    {"sku": "MOUSE-001", "name": "Wireless Gaming Mouse", "category": "Accessories", "brand": "ClickMaster", "price": 79.99, "stock": 234, "rating": 4.6, "reviews": 567, "features": ["12000 DPI", "RGB", "Wireless"], "warranty": 12, "supplier": "PeripheralsCo", "weight": 0.12, "dimensions": "5x3x1.5"},
    {"sku": "MOUSE-002", "name": "Ergonomic Office Mouse", "category": "Accessories", "brand": "ComfortClick", "price": 49.99, "stock": 178, "rating": 4.4, "reviews": 423, "features": ["Ergonomic", "Wireless", "Silent"], "warranty": 12, "supplier": "PeripheralsCo", "weight": 0.09, "dimensions": "4.5x3x2"},
    {"sku": "KEYBOARD-001", "name": "Mechanical RGB Keyboard", "category": "Accessories", "brand": "KeyMaster Pro", "price": 159.99, "stock": 89, "rating": 4.8, "reviews": 892, "features": ["Cherry MX Blue", "RGB", "USB-C"], "warranty": 24, "supplier": "PeripheralsCo", "weight": 1.1, "dimensions": "17x5x1.5"},
    {"sku": "KEYBOARD-002", "name": "Compact Wireless Keyboard", "category": "Accessories", "brand": "MiniKey", "price": 69.99, "stock": 156, "rating": 4.3, "reviews": 234, "features": ["Bluetooth", "Compact", "Rechargeable"], "warranty": 12, "supplier": "PeripheralsCo", "weight": 0.5, "dimensions": "11x4x0.8"},
    {"sku": "MONITOR-001", "name": "4K Professional Monitor 27-inch", "category": "Displays", "brand": "ViewPro", "price": 599.99, "stock": 34, "rating": 4.7, "reviews": 445, "features": ["4K UHD", "IPS", "HDR"], "warranty": 36, "supplier": "DisplayCo", "weight": 6.5, "dimensions": "24x16x2"},
    {"sku": "MONITOR-002", "name": "Gaming Monitor 32-inch Curved", "category": "Displays", "brand": "GameView", "price": 749.99, "stock": 28, "rating": 4.9, "reviews": 623, "features": ["QHD", "144Hz", "Curved"], "warranty": 24, "supplier": "DisplayCo", "weight": 8.2, "dimensions": "28x18x3"},
    {"sku": "HEADSET-001", "name": "Noise-Cancelling Headphones", "category": "Audio", "brand": "SoundPro", "price": 299.99, "stock": 112, "rating": 4.6, "reviews": 1234, "features": ["ANC", "Wireless", "40hr Battery"], "warranty": 12, "supplier": "AudioTech", "weight": 0.25, "dimensions": "7x7x3"},
    {"sku": "HEADSET-002", "name": "Gaming Headset RGB", "category": "Audio", "brand": "GameSound", "price": 129.99, "stock": 198, "rating": 4.5, "reviews": 789, "features": ["7.1 Surround", "RGB", "USB"], "warranty": 12, "supplier": "AudioTech", "weight": 0.35, "dimensions": "8x7x4"},
    {"sku": "WEBCAM-001", "name": "4K Webcam Pro", "category": "Video", "brand": "CamPro", "price": 199.99, "stock": 67, "rating": 4.7, "reviews": 345, "features": ["4K", "Auto-focus", "Privacy Shutter"], "warranty": 24, "supplier": "VideoCo", "weight": 0.18, "dimensions": "4x3x3"},
    {"sku": "CABLE-001", "name": "USB-C to USB-C Cable 2m", "category": "Accessories", "brand": "CableTech", "price": 19.99, "stock": 456, "rating": 4.5, "reviews": 234, "features": ["100W", "USB 3.2", "Braided"], "warranty": 6, "supplier": "CableCo", "weight": 0.05, "dimensions": "0.3x0.3x200"},
    {"sku": "CABLE-002", "name": "HDMI 2.1 Cable 3m", "category": "Accessories", "brand": "CableTech", "price": 24.99, "stock": 345, "rating": 4.6, "reviews": 189, "features": ["8K", "48Gbps", "eARC"], "warranty": 12, "supplier": "CableCo", "weight": 0.08, "dimensions": "0.5x0.5x300"},
    {"sku": "DOCK-001", "name": "USB-C Docking Station", "category": "Accessories", "brand": "DockMaster", "price": 249.99, "stock": 56, "rating": 4.4, "reviews": 567, "features": ["12 Ports", "100W PD", "Dual 4K"], "warranty": 24, "supplier": "DockCo", "weight": 0.65, "dimensions": "12x8x2"},
    {"sku": "CHARGER-001", "name": "GaN Charger 100W", "category": "Accessories", "brand": "FastCharge", "price": 59.99, "stock": 234, "rating": 4.7, "reviews": 892, "features": ["GaN", "3 Ports", "Foldable"], "warranty": 12, "supplier": "PowerTech", "weight": 0.19, "dimensions": "3x3x1.2"},
    {"sku": "SSD-001", "name": "External SSD 1TB", "category": "Storage", "brand": "SpeedDrive", "price": 149.99, "stock": 123, "rating": 4.8, "reviews": 678, "features": ["1050MB/s", "USB 3.2", "Portable"], "warranty": 36, "supplier": "StorageCo", "weight": 0.08, "dimensions": "4x2x0.4"},
    {"sku": "SSD-002", "name": "External SSD 2TB", "category": "Storage", "brand": "SpeedDrive", "price": 259.99, "stock": 89, "rating": 4.7, "reviews": 445, "features": ["1050MB/s", "USB 3.2", "Rugged"], "warranty": 36, "supplier": "StorageCo", "weight": 0.09, "dimensions": "4.5x2.5x0.5"},
    {"sku": "RAM-001", "name": "DDR5 32GB Kit (2x16GB)", "category": "Components", "brand": "MemoryPro", "price": 179.99, "stock": 78, "rating": 4.6, "reviews": 234, "features": ["DDR5-5600", "RGB", "CL36"], "warranty": "lifetime", "supplier": "ComponentsCo", "weight": 0.05, "dimensions": "5x0.5x0.2"},
    {"sku": "GPU-001", "name": "Graphics Card RTX 4070", "category": "Components", "brand": "GraphixPro", "price": 649.99, "stock": 12, "rating": 4.9, "reviews": 1567, "features": ["12GB VRAM", "DLSS 3", "Ray Tracing"], "warranty": 36, "supplier": "GPUDirect", "weight": 1.2, "dimensions": "12x5x2"},
    {"sku": "COOLER-001", "name": "CPU Liquid Cooler 280mm", "category": "Components", "brand": "CoolMaster", "price": 129.99, "stock": 67, "rating": 4.5, "reviews": 345, "features": ["RGB", "Silent", "280mm"], "warranty": 24, "supplier": "CoolingTech", "weight": 1.5, "dimensions": "12x12x3"},
    {"sku": "PSU-001", "name": "Modular PSU 850W Gold", "category": "Components", "brand": "PowerMax", "price": 149.99, "stock": 45, "rating": 4.7, "reviews": 567, "features": ["80+ Gold", "Modular", "Silent"], "warranty": 60, "supplier": "PowerTech", "weight": 1.8, "dimensions": "6x6x3"},
    {"sku": "CASE-001", "name": "Mid-Tower Case RGB", "category": "Components", "brand": "BuildPro", "price": 99.99, "stock": 34, "rating": 4.4, "reviews": 234, "features": ["Tempered Glass", "RGB", "ATX"], "warranty": 12, "supplier": "CaseCo", "weight": 7.5, "dimensions": "18x8x17"},
    {"sku": "SPEAKER-001", "name": "Desktop Speakers 2.1", "category": "Audio", "brand": "SoundWave", "price": 149.99, "stock": 89, "rating": 4.5, "reviews": 456, "features": ["50W", "Subwoofer", "Bluetooth"], "warranty": 12, "supplier": "AudioTech", "weight": 3.5, "dimensions": "8x6x7"},
    {"sku": "MIC-001", "name": "USB Microphone Studio", "category": "Audio", "brand": "RecordPro", "price": 169.99, "stock": 56, "rating": 4.8, "reviews": 789, "features": ["Condenser", "USB-C", "Pop Filter"], "warranty": 24, "supplier": "AudioTech", "weight": 0.55, "dimensions": "6x3x3"},
    {"sku": "TABLET-001", "name": "Drawing Tablet Pro", "category": "Creative", "brand": "ArtMaster", "price": 449.99, "stock": 23, "rating": 4.7, "reviews": 345, "features": ["8192 Pressure", "Wireless", "Tilt"], "warranty": 24, "supplier": "CreativeTech", "weight": 0.7, "dimensions": "15x10x0.3"},
    {"sku": "LIGHT-001", "name": "RGB Desk Light Bar", "category": "Accessories", "brand": "LightPro", "price": 79.99, "stock": 145, "rating": 4.6, "reviews": 567, "features": ["RGB", "App Control", "Auto-dim"], "warranty": 12, "supplier": "LightingCo", "weight": 0.45, "dimensions": "20x2x2"},
    {"sku": "CHAIR-001", "name": "Ergonomic Office Chair", "category": "Furniture", "brand": "SitWell", "price": 399.99, "stock": 18, "rating": 4.8, "reviews": 1234, "features": ["Lumbar Support", "Adjustable", "Mesh"], "warranty": 60, "supplier": "FurnitureCo", "weight": 22.0, "dimensions": "26x26x48"},
    {"sku": "DESK-001", "name": "Standing Desk Adjustable", "category": "Furniture", "brand": "StandPro", "price": 599.99, "stock": 12, "rating": 4.7, "reviews": 892, "features": ["Electric", "Memory", "60x30"], "warranty": 120, "supplier": "FurnitureCo", "weight": 45.0, "dimensions": "60x30x1.5"},
    {"sku": "PAD-001", "name": "Extended Gaming Mouse Pad", "category": "Accessories", "brand": "PadPro", "price": 34.99, "stock": 289, "rating": 4.5, "reviews": 678, "features": ["36x12", "RGB", "Waterproof"], "warranty": 6, "supplier": "PeripheralsCo", "weight": 0.4, "dimensions": "36x12x0.1"}
  ],
  "stats": {
    "totalProducts": 22,
    "totalValue": 8844.78,
    "avgPrice": 402.03,
    "avgRating": 4.65,
    "totalReviews": 11089,
    "categories": ["Computers", "Accessories", "Displays", "Audio", "Video", "Storage", "Components", "Creative", "Furniture"],
    "inStockItems": 22,
    "lowStockItems": 5
  }
}`,

    // Financial transactions (40 transactions)
    transactions: `{
  "accountId": "ACC-987654",
  "accountHolder": "John Smith",
  "period": "2025-10",
  "transactions": [
    {"id": "TXN-001", "date": "2025-10-01", "type": "debit", "category": "groceries", "merchant": "Whole Foods Market", "amount": 127.45, "balance": 4872.55, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-002", "date": "2025-10-01", "type": "credit", "category": "salary", "merchant": "Employer Direct Deposit", "amount": 5000.00, "balance": 9872.55, "status": "completed", "location": "Online"},
    {"id": "TXN-003", "date": "2025-10-02", "type": "debit", "category": "utilities", "merchant": "Pacific Gas & Electric", "amount": 156.78, "balance": 9715.77, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-004", "date": "2025-10-02", "type": "debit", "category": "transportation", "merchant": "SFMTA Monthly Pass", "amount": 98.00, "balance": 9617.77, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-005", "date": "2025-10-03", "type": "debit", "category": "dining", "merchant": "Blue Bottle Coffee", "amount": 8.50, "balance": 9609.27, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-006", "date": "2025-10-03", "type": "debit", "category": "shopping", "merchant": "Amazon.com", "amount": 89.99, "balance": 9519.28, "status": "completed", "location": "Online"},
    {"id": "TXN-007", "date": "2025-10-04", "type": "debit", "category": "groceries", "merchant": "Trader Joe's", "amount": 64.23, "balance": 9455.05, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-008", "date": "2025-10-05", "type": "debit", "category": "entertainment", "merchant": "Netflix Subscription", "amount": 15.99, "balance": 9439.06, "status": "completed", "location": "Online"},
    {"id": "TXN-009", "date": "2025-10-05", "type": "debit", "category": "entertainment", "merchant": "Spotify Premium", "amount": 10.99, "balance": 9428.07, "status": "completed", "location": "Online"},
    {"id": "TXN-010", "date": "2025-10-06", "type": "debit", "category": "dining", "merchant": "Chipotle Mexican Grill", "amount": 14.75, "balance": 9413.32, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-011", "date": "2025-10-07", "type": "debit", "category": "shopping", "merchant": "Target", "amount": 142.56, "balance": 9270.76, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-012", "date": "2025-10-08", "type": "debit", "category": "health", "merchant": "CVS Pharmacy", "amount": 45.30, "balance": 9225.46, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-013", "date": "2025-10-09", "type": "debit", "category": "dining", "merchant": "Starbucks", "amount": 12.45, "balance": 9213.01, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-014", "date": "2025-10-10", "type": "debit", "category": "transportation", "merchant": "Uber", "amount": 28.50, "balance": 9184.51, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-015", "date": "2025-10-11", "type": "debit", "category": "groceries", "merchant": "Safeway", "amount": 98.67, "balance": 9085.84, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-016", "date": "2025-10-12", "type": "debit", "category": "shopping", "merchant": "Apple Store", "amount": 1299.00, "balance": 7786.84, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-017", "date": "2025-10-13", "type": "debit", "category": "dining", "merchant": "The French Laundry", "amount": 385.00, "balance": 7401.84, "status": "completed", "location": "Yountville, CA"},
    {"id": "TXN-018", "date": "2025-10-14", "type": "debit", "category": "utilities", "merchant": "Comcast Internet", "amount": 89.99, "balance": 7311.85, "status": "completed", "location": "San Francisco, CA"},
    {"id": "TXN-019", "date": "2025-10-15", "type": "credit", "category": "refund", "merchant": "Amazon.com Refund", "amount": 29.99, "balance": 7341.84, "status": "completed", "location": "Online"},
    {"id": "TXN-020", "date": "2025-10-16", "type": "debit", "category": "groceries", "merchant": "Whole Foods Market", "amount": 134.56, "balance": 7207.28, "status": "completed", "location": "San Francisco, CA"}
  ],
  "summary": {
    "totalDebits": 2752.71,
    "totalCredits": 5029.99,
    "netChange": 2277.28,
    "openingBalance": 5000.00,
    "closingBalance": 7207.28,
    "avgTransactionSize": 136.36,
    "largestTransaction": 1299.00,
    "transactionCount": 20
  }
}`,

    // API logs (50 entries)
    apiLogs: `{
  "service": "api-gateway-prod",
  "region": "us-west-2",
  "timeRange": "2025-11-04 12:00:00 - 12:15:00 UTC",
  "logs": [
    {"timestamp": "2025-11-04T12:00:12.234Z", "level": "INFO", "method": "GET", "path": "/api/v1/users/1234", "status": 200, "duration": 45, "ip": "192.168.1.100", "userAgent": "Mozilla/5.0", "userId": "user_1234", "requestId": "req_abc123"},
    {"timestamp": "2025-11-04T12:00:15.567Z", "level": "INFO", "method": "POST", "path": "/api/v1/orders", "status": 201, "duration": 234, "ip": "192.168.1.101", "userAgent": "Mobile/iOS", "userId": "user_5678", "requestId": "req_abc124"},
    {"timestamp": "2025-11-04T12:00:18.890Z", "level": "WARN", "method": "GET", "path": "/api/v1/products/999", "status": 404, "duration": 12, "ip": "192.168.1.102", "userAgent": "curl/7.68.0", "userId": null, "requestId": "req_abc125"},
    {"timestamp": "2025-11-04T12:00:23.123Z", "level": "ERROR", "method": "POST", "path": "/api/v1/payment", "status": 500, "duration": 5234, "ip": "192.168.1.103", "userAgent": "PostmanRuntime", "userId": "user_9012", "requestId": "req_abc126", "error": "Database timeout"},
    {"timestamp": "2025-11-04T12:00:28.456Z", "level": "INFO", "method": "GET", "path": "/api/v1/search", "status": 200, "duration": 89, "ip": "192.168.1.104", "userAgent": "Mozilla/5.0", "userId": "user_3456", "requestId": "req_abc127", "query": "laptop"},
    {"timestamp": "2025-11-04T12:00:32.789Z", "level": "INFO", "method": "PUT", "path": "/api/v1/users/1234/profile", "status": 200, "duration": 123, "ip": "192.168.1.100", "userAgent": "Mozilla/5.0", "userId": "user_1234", "requestId": "req_abc128"},
    {"timestamp": "2025-11-04T12:00:38.012Z", "level": "INFO", "method": "DELETE", "path": "/api/v1/cart/items/789", "status": 204, "duration": 56, "ip": "192.168.1.105", "userAgent": "Mobile/Android", "userId": "user_7890", "requestId": "req_abc129"},
    {"timestamp": "2025-11-04T12:00:42.345Z", "level": "INFO", "method": "GET", "path": "/api/v1/recommendations", "status": 200, "duration": 456, "ip": "192.168.1.106", "userAgent": "Mozilla/5.0", "userId": "user_2345", "requestId": "req_abc130"},
    {"timestamp": "2025-11-04T12:00:47.678Z", "level": "WARN", "method": "POST", "path": "/api/v1/login", "status": 401, "duration": 34, "ip": "192.168.1.107", "userAgent": "curl/7.68.0", "userId": null, "requestId": "req_abc131", "reason": "Invalid credentials"},
    {"timestamp": "2025-11-04T12:00:52.901Z", "level": "INFO", "method": "GET", "path": "/api/v1/analytics/dashboard", "status": 200, "duration": 678, "ip": "192.168.1.108", "userAgent": "Mozilla/5.0", "userId": "user_admin", "requestId": "req_abc132"},
    {"timestamp": "2025-11-04T12:01:01.234Z", "level": "INFO", "method": "GET", "path": "/api/v1/users/5678", "status": 200, "duration": 38, "ip": "192.168.1.109", "userAgent": "Mozilla/5.0", "userId": "user_5678", "requestId": "req_abc133"},
    {"timestamp": "2025-11-04T12:01:05.567Z", "level": "INFO", "method": "POST", "path": "/api/v1/reviews", "status": 201, "duration": 189, "ip": "192.168.1.110", "userAgent": "Mobile/iOS", "userId": "user_6789", "requestId": "req_abc134"},
    {"timestamp": "2025-11-04T12:01:10.890Z", "level": "INFO", "method": "GET", "path": "/api/v1/orders/history", "status": 200, "duration": 234, "ip": "192.168.1.111", "userAgent": "Mozilla/5.0", "userId": "user_1234", "requestId": "req_abc135"},
    {"timestamp": "2025-11-04T12:01:16.123Z", "level": "ERROR", "method": "POST", "path": "/api/v1/checkout", "status": 503, "duration": 30001, "ip": "192.168.1.112", "userAgent": "Mobile/Android", "userId": "user_8901", "requestId": "req_abc136", "error": "Payment gateway timeout"},
    {"timestamp": "2025-11-04T12:01:22.456Z", "level": "INFO", "method": "GET", "path": "/api/v1/inventory", "status": 200, "duration": 123, "ip": "192.168.1.113", "userAgent": "Python/3.9", "userId": "service_inventory", "requestId": "req_abc137"},
    {"timestamp": "2025-11-04T12:01:28.789Z", "level": "INFO", "method": "PATCH", "path": "/api/v1/settings", "status": 200, "duration": 67, "ip": "192.168.1.114", "userAgent": "Mozilla/5.0", "userId": "user_admin", "requestId": "req_abc138"},
    {"timestamp": "2025-11-04T12:01:34.012Z", "level": "INFO", "method": "GET", "path": "/health", "status": 200, "duration": 3, "ip": "10.0.0.5", "userAgent": "ELB-HealthChecker", "userId": null, "requestId": "req_abc139"},
    {"timestamp": "2025-11-04T12:01:40.345Z", "level": "INFO", "method": "GET", "path": "/metrics", "status": 200, "duration": 8, "ip": "10.0.0.6", "userAgent": "Prometheus", "userId": null, "requestId": "req_abc140"},
    {"timestamp": "2025-11-04T12:01:46.678Z", "level": "INFO", "method": "POST", "path": "/api/v1/webhooks/stripe", "status": 200, "duration": 456, "ip": "54.187.123.45", "userAgent": "Stripe/1.0", "userId": null, "requestId": "req_abc141"},
    {"timestamp": "2025-11-04T12:01:52.901Z", "level": "INFO", "method": "GET", "path": "/api/v1/users/search", "status": 200, "duration": 234, "ip": "192.168.1.115", "userAgent": "Mozilla/5.0", "userId": "user_admin", "requestId": "req_abc142", "results": 45}
  ],
  "metrics": {
    "totalRequests": 20,
    "successRate": 85.0,
    "avgDuration": 2045,
    "p50Duration": 123,
    "p95Duration": 5234,
    "p99Duration": 30001,
    "errorCount": 2,
    "warnCount": 2,
    "uniqueUsers": 12,
    "uniqueIPs": 16,
    "topEndpoints": ["/api/v1/users", "/api/v1/orders", "/api/v1/search"]
  }
}`,

    // User analytics (60 users)
    analytics: `{
  "reportDate": "2025-11-04",
  "reportType": "user-engagement",
  "users": [
    {"userId": "u001", "username": "alice_tech", "signupDate": "2025-01-15", "lastActive": "2025-11-04", "sessionsCount": 234, "avgSessionDuration": 1245, "totalPageViews": 5678, "bounceRate": 23.4, "conversionRate": 4.5, "country": "USA", "device": "desktop", "browser": "Chrome"},
    {"userId": "u002", "username": "bob_dev", "signupDate": "2025-02-20", "lastActive": "2025-11-03", "sessionsCount": 189, "avgSessionDuration": 987, "totalPageViews": 4321, "bounceRate": 28.9, "conversionRate": 3.2, "country": "Canada", "device": "mobile", "browser": "Safari"},
    {"userId": "u003", "username": "carol_pm", "signupDate": "2025-03-10", "lastActive": "2025-11-04", "sessionsCount": 312, "avgSessionDuration": 1567, "totalPageViews": 7890, "bounceRate": 18.7, "conversionRate": 6.7, "country": "UK", "device": "desktop", "browser": "Firefox"},
    {"userId": "u004", "username": "dave_design", "signupDate": "2025-04-05", "lastActive": "2025-11-02", "sessionsCount": 156, "avgSessionDuration": 2345, "totalPageViews": 3456, "bounceRate": 31.2, "conversionRate": 2.8, "country": "Germany", "device": "tablet", "browser": "Chrome"},
    {"userId": "u005", "username": "emma_data", "signupDate": "2025-05-12", "lastActive": "2025-11-04", "sessionsCount": 445, "avgSessionDuration": 876, "totalPageViews": 9012, "bounceRate": 15.6, "conversionRate": 8.9, "country": "USA", "device": "desktop", "browser": "Edge"},
    {"userId": "u006", "username": "frank_ops", "signupDate": "2025-06-18", "lastActive": "2025-11-01", "sessionsCount": 267, "avgSessionDuration": 1123, "totalPageViews": 5234, "bounceRate": 25.3, "conversionRate": 4.1, "country": "Australia", "device": "desktop", "browser": "Chrome"},
    {"userId": "u007", "username": "grace_ml", "signupDate": "2025-07-22", "lastActive": "2025-11-04", "sessionsCount": 523, "avgSessionDuration": 1890, "totalPageViews": 12345, "bounceRate": 12.4, "conversionRate": 9.8, "country": "USA", "device": "desktop", "browser": "Chrome"},
    {"userId": "u008", "username": "henry_sec", "signupDate": "2025-08-30", "lastActive": "2025-11-03", "sessionsCount": 198, "avgSessionDuration": 1456, "totalPageViews": 4567, "bounceRate": 22.1, "conversionRate": 5.3, "country": "France", "device": "mobile", "browser": "Safari"},
    {"userId": "u009", "username": "ivy_product", "signupDate": "2025-09-14", "lastActive": "2025-11-04", "sessionsCount": 378, "avgSessionDuration": 1678, "totalPageViews": 8901, "bounceRate": 19.8, "conversionRate": 7.2, "country": "Japan", "device": "desktop", "browser": "Chrome"},
    {"userId": "u010", "username": "jack_backend", "signupDate": "2025-10-08", "lastActive": "2025-11-04", "sessionsCount": 412, "avgSessionDuration": 1345, "totalPageViews": 9876, "bounceRate": 17.6, "conversionRate": 6.9, "country": "USA", "device": "desktop", "browser": "Firefox"},
    {"userId": "u011", "username": "kate_frontend", "signupDate": "2025-11-03", "lastActive": "2025-11-03", "sessionsCount": 89, "avgSessionDuration": 2134, "totalPageViews": 2345, "bounceRate": 34.5, "conversionRate": 1.9, "country": "Spain", "device": "tablet", "browser": "Safari"},
    {"userId": "u012", "username": "leo_infra", "signupDate": "2025-12-10", "lastActive": "2025-11-04", "sessionsCount": 334, "avgSessionDuration": 987, "totalPageViews": 7123, "bounceRate": 21.3, "conversionRate": 5.8, "country": "Brazil", "device": "desktop", "browser": "Chrome"},
    {"userId": "u013", "username": "mia_qa", "signupDate": "2025-01-05", "lastActive": "2025-11-02", "sessionsCount": 223, "avgSessionDuration": 1234, "totalPageViews": 5456, "bounceRate": 26.7, "conversionRate": 4.3, "country": "India", "device": "mobile", "browser": "Chrome"},
    {"userId": "u014", "username": "noah_docs", "signupDate": "2025-02-14", "lastActive": "2025-11-04", "sessionsCount": 156, "avgSessionDuration": 2567, "totalPageViews": 3789, "bounceRate": 29.8, "conversionRate": 3.6, "country": "Singapore", "device": "desktop", "browser": "Edge"},
    {"userId": "u015", "username": "olivia_support", "signupDate": "2025-03-20", "lastActive": "2025-11-04", "sessionsCount": 567, "avgSessionDuration": 1789, "totalPageViews": 13456, "bounceRate": 14.2, "conversionRate": 8.4, "country": "USA", "device": "desktop", "browser": "Chrome"}
  ],
  "aggregates": {
    "totalUsers": 15,
    "totalSessions": 4483,
    "avgSessionDuration": 1481,
    "totalPageViews": 93453,
    "avgBounceRate": 22.7,
    "avgConversionRate": 5.5,
    "topCountries": ["USA", "UK", "Canada", "Germany", "Japan"],
    "deviceBreakdown": {"desktop": 67, "mobile": 23, "tablet": 10},
    "browserBreakdown": {"Chrome": 73, "Safari": 15, "Firefox": 8, "Edge": 4}
  }
}`,

    // Comprehensive nested structure
    config: `{
  "application": {
    "name": "Production API Server",
    "version": "2.5.3",
    "environment": "production",
    "region": "us-west-2",
    "deployment": {
      "strategy": "blue-green",
      "replicas": 5,
      "minReplicas": 3,
      "maxReplicas": 20,
      "autoscaling": {
        "enabled": true,
        "cpuThreshold": 70,
        "memoryThreshold": 80,
        "scaleUpDelay": 60,
        "scaleDownDelay": 300
      }
    },
    "database": {
      "primary": {
        "host": "prod-db-master.example.com",
        "port": 5432,
        "database": "production",
        "ssl": true,
        "poolSize": 20,
        "maxConnections": 100,
        "connectionTimeout": 5000,
        "queryTimeout": 30000
      },
      "replicas": [
        {"host": "prod-db-replica-1.example.com", "port": 5432, "priority": 1, "lag": 0},
        {"host": "prod-db-replica-2.example.com", "port": 5432, "priority": 2, "lag": 100},
        {"host": "prod-db-replica-3.example.com", "port": 5432, "priority": 3, "lag": 200}
      ]
    },
    "cache": {
      "redis": {
        "enabled": true,
        "cluster": [
          {"host": "redis-1.example.com", "port": 6379, "role": "master"},
          {"host": "redis-2.example.com", "port": 6379, "role": "slave"},
          {"host": "redis-3.example.com", "port": 6379, "role": "slave"}
        ],
        "ttl": 3600,
        "maxMemory": "2gb",
        "evictionPolicy": "allkeys-lru"
      }
    },
    "monitoring": {
      "metrics": {
        "enabled": true,
        "interval": 60,
        "retention": 2592000,
        "exporters": ["prometheus", "cloudwatch", "datadog"]
      },
      "logging": {
        "level": "info",
        "format": "json",
        "outputs": ["stdout", "file", "cloudwatch"],
        "rotation": {
          "maxSize": "100mb",
          "maxAge": 30,
          "compress": true
        }
      },
      "tracing": {
        "enabled": true,
        "samplingRate": 0.1,
        "exporter": "jaeger",
        "endpoint": "jaeger.example.com:14268"
      }
    },
    "security": {
      "authentication": {
        "providers": ["jwt", "oauth2", "api-key"],
        "jwtSecret": "***REDACTED***",
        "tokenExpiry": 3600,
        "refreshTokenExpiry": 2592000
      },
      "rateLimit": {
        "enabled": true,
        "windowMs": 900000,
        "maxRequests": 100,
        "skipSuccessfulRequests": false,
        "skipFailedRequests": false
      },
      "cors": {
        "enabled": true,
        "origins": ["https://app.example.com", "https://admin.example.com"],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH"],
        "credentials": true
      }
    },
    "features": {
      "experimentalMode": false,
      "maintenanceMode": false,
      "readOnlyMode": false,
      "apiVersioning": true,
      "webhooksEnabled": true,
      "analyticsEnabled": true,
      "cacheEnabled": true
    }
  }
}`,

    // Real-world mixed complexity
    mixed: `{
  "string": "Hello TONL - Token Optimized Notation Language",
  "number": 42,
  "float": 3.14159265359,
  "scientific": 6.022e23,
  "boolean": true,
  "null": null,
  "emptyString": "",
  "specialChars": "Symbols: @#$%^&*()_+-=[]{}|;:',.<>?/",
  "unicode": "Unicode: 你好世界 🚀 ñáéíóú",
  "multiline": "Line 1\\nLine 2\\nLine 3",
  "array": [1, "two", 3.0, false, null, [1, 2, 3], {"nested": "object"}],
  "nested": {
    "level1": {
      "level2": {
        "level3": {
          "level4": {
            "value": "deeply nested structure",
            "array": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
          }
        }
      }
    }
  },
  "mixed_array": [
    {"type": "object", "value": 1, "metadata": {"source": "api", "validated": true}},
    "plain string value",
    42,
    [1, 2, 3, 4, 5],
    {"nested": {"value": "complex", "array": [{"id": 1}, {"id": 2}]}},
    null,
    true,
    false,
    3.14159,
    {"empty": {}}
  ],
  "timestamps": {
    "created": "2025-01-15T10:30:00.000Z",
    "modified": "2025-11-04T12:00:00.000Z",
    "accessed": "2025-11-04T14:30:00.000Z"
  },
  "metadata": {
    "version": "1.0.5",
    "format": "json",
    "encoding": "utf-8",
    "size": 1024,
    "checksum": "abc123def456",
    "compressed": false
  }
}`
};
