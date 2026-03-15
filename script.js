/* script.js */
const { createApp, ref, reactive } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

const Dashboard = {
    template: `
        <div>
            <header><h1>لوحة التحكم</h1></header>
            <section class="dashboard-cards">
                <div class="card" @click="$router.push('/trips')"><h3>عدد النقلات اليومية</h3><p>0</p></div>
                <div class="card" @click="$router.push('/trips')"><h3>عدد النقلات الشهرية</h3><p>0</p></div>
                <div class="card" @click="$router.push('/factories')"><h3>مجموع الديون على المعامل</h3><p>0</p></div>
                <div class="card" @click="$router.push('/reports')"><h3>أرباح سيارات الشركة</h3><p>0</p></div>
                <div class="card" @click="$router.push('/documents')"><h3>تنبيهات انتهاء الوثائق</h3><p>0</p></div>
                <div class="card" @click="$router.push('/factories')"><h3>تنبيه قرب انتهاء كمية المعامل</h3><p>0</p></div>
            </section>
            <section class="generic-section">
                <h2>نموذج تسجيل نقلة جديدة</h2>
                <form @submit.prevent="save">
                    <div class="form-group"><label>رقم المستند:</label><input type="text" required></div>
                    <div class="form-group"><label>التاريخ:</label><input type="date" required></div>
                    <div class="form-group"><label>اسم السائق:</label><input type="text" required></div>
                    <div class="form-group"><label>المعمل:</label><input type="text" required></div>
                    <div class="form-group"><label>رقم السيارة (تلقائي):</label><input type="text" readonly></div>
                    <div class="form-group"><label>اسم الناقل أو سيارة الشركة (تلقائي):</label><input type="text" readonly></div>
                    <div class="form-group"><label>الحمولة (تلقائي):</label><input type="text" readonly></div>
                    <button type="submit" class="btn-success">حفظ النقلة</button>
                </form>
            </section>
        </div>
    `,
    methods: { save() { alert('تم الحفظ بنجاح'); } }
};

const Trips = {
    template: `
        <div class="generic-section">
            <h2>إدارة النقلات</h2>
            <div class="action-bar">
                <button class="btn-primary">إضافة نقلة</button>
                <button class="btn-primary">تعديل</button>
                <button class="btn-danger">حذف</button>
                <button class="btn-primary">عرض</button>
                <button class="btn-primary">بحث</button>
                <button class="btn-primary">فلترة</button>
                <button class="btn-success">استيراد Excel</button>
                <button class="btn-primary">تصدير Excel</button>
                <button class="btn-primary">طباعة</button>
            </div>
            <table>
                <tr>
                    <th>رقم المستند</th><th>التاريخ</th><th>اسم السائق</th><th>رقم السيارة</th>
                    <th>اسم الناقل / سيارة الشركة</th><th>المعمل</th><th>الحمولة</th><th>مبلغ النقلة</th>
                    <th>حالة الفوترة</th><th>أزرار العمليات</th>
                </tr>
            </table>
        </div>
    `
};

const Carriers = {
    template: `
        <div class="generic-section">
            <h2>إدارة الناقلين</h2>
            <div class="action-bar">
                <button class="btn-primary">إضافة ناقل</button>
                <button class="btn-primary">تعديل</button>
                <button class="btn-danger">حذف</button>
                <button class="btn-primary">عرض</button>
                <button class="btn-primary">إضافة سيارة</button>
                <button class="btn-success">استيراد Excel</button>
                <button class="btn-primary">تصدير Excel</button>
            </div>
            <table>
                <tr><th>اسم الناقل</th><th>رقم الهاتف</th><th>عدد السيارات</th><th>أزرار العمليات</th></tr>
            </table>
        </div>
    `
};

const CompanyTrucks = {
    template: `
        <div class="generic-section">
            <h2>سيارات الشركة</h2>
            <div class="action-bar">
                <button class="btn-primary">إضافة سيارة</button>
                <button class="btn-primary">تعديل</button>
                <button class="btn-danger">حذف</button>
                <button class="btn-primary">عرض</button>
                <button class="btn-primary" @click="$router.push('/documents')">الوثائق</button>
                <button class="btn-primary" @click="$router.push('/expenses')">المصاريف</button>
                <button class="btn-primary">الأرباح</button>
                <button class="btn-primary">طباعة</button>
            </div>
            <table>
                <tr>
                    <th>رقم السيارة</th><th>اسم السائق</th><th>الحمولة</th><th>عدد الوثائق</th>
                    <th>عدد الوثائق القريبة من الانتهاء</th><th>إجمالي المصاريف</th><th>صافي الربح</th><th>أزرار العمليات</th>
                </tr>
            </table>
        </div>
    `
};

const Documents = {
    template: `
        <div class="generic-section">
            <h2>وثائق سيارات الشركة</h2>
            <div class="action-bar">
                <button class="btn-primary">رفع وثيقة</button>
                <button class="btn-primary">عرض</button>
                <button class="btn-primary">تعديل</button>
                <button class="btn-danger">حذف</button>
                <button class="btn-primary">طباعة A4</button>
            </div>
            <table>
                <tr><th>نوع الوثيقة</th><th>تاريخ الإصدار</th><th>تاريخ الانتهاء</th><th>حالة الوثيقة</th><th>أزرار العمليات</th></tr>
            </table>
        </div>
    `
};

const Expenses = {
    template: `
        <div class="generic-section">
            <h2>مصاريف سيارات الشركة</h2>
            <div class="action-bar">
                <button class="btn-primary">إضافة مصروف</button>
                <button class="btn-primary">تعديل</button>
                <button class="btn-danger">حذف</button>
                <button class="btn-primary">بحث</button>
                <button class="btn-primary">فلترة</button>
                <button class="btn-primary">تصدير Excel</button>
            </div>
            <table>
                <tr><th>التاريخ</th><th>نوع المصروف</th><th>المبلغ</th><th>الملاحظات</th><th>أزرار العمليات</th></tr>
            </table>
        </div>
    `
};

const Factories = {
    template: `
        <div class="generic-section">
            <h2>المعامل</h2>
            <div class="action-bar">
                <button class="btn-primary">إضافة معمل</button>
                <button class="btn-primary">تعديل</button>
                <button class="btn-danger">حذف</button>
                <button class="btn-primary">عرض</button>
                <button class="btn-primary">كشف الحركة</button>
                <button class="btn-primary">تصدير Excel</button>
            </div>
            <table>
                <tr>
                    <th>اسم المعمل</th><th>الكمية الشهرية</th><th>السعر</th><th>نوع السعر</th>
                    <th>الكمية المنقولة</th><th>الكمية المتبقية</th><th>الديون</th><th>أزرار العمليات</th>
                </tr>
            </table>
        </div>
    `
};

const Invoices = {
    template: `
        <div class="generic-section">
            <h2>الفواتير</h2>
            <div class="action-bar">
                <button class="btn-primary">إنشاء فاتورة</button>
                <button class="btn-primary">عرض</button>
                <button class="btn-primary">تعديل</button>
                <button class="btn-danger">حذف</button>
                <button class="btn-success">تأكيد الفاتورة</button>
                <button class="btn-primary">طباعة</button>
                <button class="btn-primary">تصدير</button>
            </div>
            <table>
                <tr><th>رقم الفاتورة</th><th>النوع</th><th>الجهة</th><th>التاريخ</th><th>الفترة</th><th>الإجمالي</th><th>الحالة</th><th>أزرار العمليات</th></tr>
            </table>
        </div>
    `
};

const Advances = {
    template: `
        <div class="generic-section">
            <h2>السلف</h2>
            <h3>رصيد موظف السلف الحالي: 0</h3>
            <div class="action-bar">
                <button class="btn-primary">إضافة سلفة</button>
                <button class="btn-primary">تعديل</button>
                <button class="btn-danger">حذف</button>
                <button class="btn-primary">عرض</button>
                <button class="btn-primary">بحث</button>
                <button class="btn-primary">فلترة</button>
                <button class="btn-primary">تصدير Excel</button>
            </div>
            <table>
                <tr><th>التاريخ</th><th>اسم السائق</th><th>رقم المستند</th><th>المعمل</th><th>مبلغ السلفة</th><th>الموظف</th><th>أزرار العمليات</th></tr>
            </table>
        </div>
    `
};

const Cashbox = {
    template: `
        <div class="generic-section">
            <h2>الصندوق</h2>
            <h3>الرصيد الحالي: 0</h3>
            <div class="action-bar">
                <button class="btn-success">إضافة وارد</button>
                <button class="btn-danger">إضافة صادر</button>
                <button class="btn-primary">تعديل</button>
                <button class="btn-danger">حذف</button>
                <button class="btn-primary">بحث</button>
                <button class="btn-primary">فلترة</button>
                <button class="btn-primary">تصدير Excel</button>
                <button class="btn-primary">طباعة كشف</button>
            </div>
            <table>
                <tr><th>التاريخ</th><th>النوع</th><th>الفئة</th><th>المبلغ</th><th>الوصف</th><th>الجهة المرتبطة</th><th>المستخدم</th><th>أزرار العمليات</th></tr>
            </table>
        </div>
    `
};

const Reports = {
    template: `
        <div class="generic-section">
            <h2>التقارير</h2>
            <div class="action-bar">
                <button class="btn-primary">عرض التقرير</button>
                <button class="btn-primary">تصفية</button>
                <button class="btn-primary">إعادة تعيين</button>
                <button class="btn-primary">تصدير Excel</button>
                <button class="btn-primary">طباعة</button>
            </div>
            <ul>
                <li>تقرير النقلات اليومية</li>
                <li>تقرير النقلات الشهرية</li>
                <li>تقرير المعامل</li>
                <li>تقرير الناقلين</li>
                <li>تقرير سيارات الشركة</li>
                <li>تقرير السلف</li>
                <li>تقرير الأرباح</li>
                <li>تقرير الديون</li>
            </ul>
        </div>
    `
};

const routes = [
    { path: '/', component: Dashboard },
    { path: '/trips', component: Trips },
    { path: '/carriers', component: Carriers },
    { path: '/company-trucks', component: CompanyTrucks },
    { path: '/documents', component: Documents },
    { path: '/expenses', component: Expenses },
    { path: '/factories', component: Factories },
    { path: '/invoices', component: Invoices },
    { path: '/advances', component: Advances },
    { path: '/cashbox', component: Cashbox },
    { path: '/reports', component: Reports },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const app = createApp({});
app.use(router);
app.mount('#app');
