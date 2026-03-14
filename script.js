// 1. قاعدة بيانات وهمية (Simulated Database) للسائقين للتجربة
// في النظام الحقيقي، هذه البيانات تأتي من قاعدة بيانات PostgreSQL عبر Laravel
const driversData = {
    "علي أحمد": {
        truckNumber: "1234 بغداد",
        carrierName: "شركة الرافدين",
        capacity: "36000"
    },
    "عمر حسن": {
        truckNumber: "5678 بصرة",
        carrierName: "شركة الجنوب",
        capacity: "40000"
    }
};

// مصفوفة وهمية لتخزين النقلات للتحقق من التكرار
const savedTrips = [];

// 2. جلب العناصر من صفحة HTML
const driverNameInput = document.getElementById('driver-name');
const truckNumberInput = document.getElementById('truck-number');
const carrierNameInput = document.getElementById('carrier-name');
const capacityInput = document.getElementById('capacity');
const form = document.getElementById('trip-form');
const docNumberInput = document.getElementById('doc-number');
const dateInput = document.getElementById('trip-date');

// 3. إضافة حدث (Event Listener) عند كتابة اسم السائق
driverNameInput.addEventListener('input', function() {
    const typedName = driverNameInput.value.trim(); // أخذ القيمة المدخلة وإزالة المسافات

    // البحث عن الاسم في قاعدة البيانات الوهمية
    if (driversData[typedName]) {
        // إذا وجد السائق، املأ الحقول التلقائية
        truckNumberInput.value = driversData[typedName].truckNumber;
        carrierNameInput.value = driversData[typedName].carrierName;
        capacityInput.value = driversData[typedName].capacity;
        
        // تغيير لون الحقول للدلالة على نجاح العملية
        truckNumberInput.style.borderColor = "#27ae60";
        carrierNameInput.style.borderColor = "#27ae60";
        capacityInput.style.borderColor = "#27ae60";
    } else {
        // إذا لم يجد السائق، أفرغ الحقول
        truckNumberInput.value = "";
        carrierNameInput.value = "";
        capacityInput.value = "";
        
        truckNumberInput.style.borderColor = "#ccc";
        carrierNameInput.style.borderColor = "#ccc";
        capacityInput.style.borderColor = "#ccc";
    }
});

// 4. معالجة إرسال النموذج (حفظ النقلة) والتحقق من القاعدة المهمة
form.addEventListener('submit', function(event) {
    event.preventDefault(); // منع إعادة تحميل الصفحة

    const docNum = docNumberInput.value;
    const tripDate = dateInput.value;

    // القاعدة: لا يسمح بتكرار رقم المستند + التاريخ
    const isDuplicate = savedTrips.some(trip => trip.document === docNum && trip.date === tripDate);

    if (isDuplicate) {
        alert('خطأ: لا يمكن تكرار نفس رقم المستند في نفس التاريخ!');
    } else {
        // حفظ النقلة في المصفوفة الوهمية
        savedTrips.push({ document: docNum, date: tripDate });
        alert('تم حفظ النقلة بنجاح!');
        form.reset(); // تفريغ النموذج بعد الحفظ
        
        // تفريغ الحقول التلقائية برمجياً
        truckNumberInput.value = "";
        carrierNameInput.value = "";
        capacityInput.value = "";
    }
});
