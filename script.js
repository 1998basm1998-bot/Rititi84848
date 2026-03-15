const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// بيانات السائقين الوهمية للاختبار والتعبئة التلقائية
const driversDatabase = {
    "علي": { truck_number: "111 بغداد", carrier_name: "شركة الرافدين", capacity: "36000" },
    "عمر": { truck_number: "222 بصرة", carrier_name: "سيارة الشركة", capacity: "40000" },
    "حسن": { truck_number: "333 اربيل", carrier_name: "شركة الشمال", capacity: "36000" }
};

// دالة تصدير Excel (CSV)
function exportToExcel(filename, headers, rows) {
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(item => `"${item || ''}"`).join(',') + '\n';
    });
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename + ".csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const Dashboard = {
    template: `
        <div>
            <header><h1>لوحة التحكم</h1></header>
            <section class="dashboard-cards">
                <div class="card" @click="$router.push('/trips')"><h3>عدد النقلات اليومية</h3><p>0</p></div>
                <div class="card" @click="$router.push('/trips')"><h3>عدد النقلات الشهرية</h3><p>0</p></div>
                <div class="card" @click="$router.push('/factories')"><h3>مجموع الديون على المعامل</h3><p>0</p></div>
                <div class="card" @click="$router.push('/reports')"><h3>أرباح سيارات الشركة</h3><p>0</p></div>
            </section>
        </div>
    `
};

const Expenses = {
    data() {
        return {
            expenses: [],
            showModal: false,
            isEditing: false,
            selectedId: null,
            searchQuery: '',
            filterFrom: '',
            filterTo: '',
            form: { id: null, date: '', type: 'وقود', amount: '', notes: '' }
        };
    },
    computed: {
        filteredExpenses() {
            return this.expenses.filter(exp => {
                const matchSearch = exp.type.includes(this.searchQuery) || 
                                    exp.notes.includes(this.searchQuery) || 
                                    exp.amount.toString().includes(this.searchQuery);
                const matchFrom = this.filterFrom ? exp.date >= this.filterFrom : true;
                const matchTo = this.filterTo ? exp.date <= this.filterTo : true;
                return matchSearch && matchFrom && matchTo;
            });
        }
    },
    methods: {
        openAddModal() {
            this.form = { id: Date.now(), date: '', type: 'وقود', amount: '', notes: '' };
            this.isEditing = false;
            this.showModal = true;
        },
        openEditModal() {
            if (!this.selectedId) return alert('يرجى تحديد صف للتعديل');
            const exp = this.expenses.find(e => e.id === this.selectedId);
            this.form = { ...exp };
            this.isEditing = true;
            this.showModal = true;
        },
        saveExpense() {
            if (this.isEditing) {
                const index = this.expenses.findIndex(e => e.id === this.form.id);
                this.expenses[index] = { ...this.form };
            } else {
                this.expenses.push({ ...this.form });
            }
            this.showModal = false;
            this.selectedId = null;
        },
        deleteExpense() {
            if (!this.selectedId) return alert('يرجى تحديد صف للحذف');
            if (confirm('هل تريد حذف هذا المصروف؟')) {
                this.expenses = this.expenses.filter(e => e.id !== this.selectedId);
                this.selectedId = null;
            }
        },
        selectRow(id) {
            this.selectedId = id;
        },
        exportData() {
            const headers = ['التاريخ', 'نوع المصروف', 'المبلغ', 'الملاحظات'];
            const rows = this.filteredExpenses.map(e => [e.date, e.type, e.amount, e.notes]);
            exportToExcel('المصاريف', headers, rows);
        }
    },
    template: `
        <div class="generic-section">
            <h2>مصاريف سيارات الشركة</h2>
            
            <div class="filters-box">
                <input type="text" v-model="searchQuery" placeholder="بحث...">
                <label>من تاريخ:</label> <input type="date" v-model="filterFrom">
                <label>إلى تاريخ:</label> <input type="date" v-model="filterTo">
            </div>

            <div class="action-bar">
                <button class="btn-success" @click="openAddModal">إضافة مصروف</button>
                <button class="btn-warning" @click="openEditModal">تعديل</button>
                <button class="btn-danger" @click="deleteExpense">حذف</button>
                <button class="btn-primary" @click="exportData">تصدير Excel</button>
            </div>

            <table>
                <tr>
                    <th>التاريخ</th><th>نوع المصروف</th><th>المبلغ</th><th>الملاحظات</th>
                </tr>
                <tr v-for="exp in filteredExpenses" :key="exp.id" @click="selectRow(exp.id)" :class="{'selected-row': selectedId === exp.id}">
                    <td>{{ exp.date }}</td>
                    <td>{{ exp.type }}</td>
                    <td>{{ exp.amount }}</td>
                    <td>{{ exp.notes }}</td>
                </tr>
            </table>

            <div v-if="showModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>{{ isEditing ? 'تعديل مصروف' : 'إضافة مصروف' }}</h3>
                    <div class="form-group"><label>التاريخ</label><input type="date" v-model="form.date"></div>
                    <div class="form-group">
                        <label>نوع المصروف</label>
                        <select v-model="form.type">
                            <option value="وقود">وقود</option>
                            <option value="تصليح">تصليح</option>
                            <option value="زيت">زيت</option>
                            <option value="إطارات">إطارات</option>
                            <option value="صيانة">صيانة</option>
                            <option value="أخرى">أخرى</option>
                        </select>
                    </div>
                    <div class="form-group"><label>المبلغ</label><input type="number" v-model="form.amount"></div>
                    <div class="form-group"><label>الملاحظات</label><textarea v-model="form.notes"></textarea></div>
                    <div class="modal-actions">
                        <button class="btn-success" @click="saveExpense">حفظ</button>
                        <button class="btn-danger" @click="showModal = false">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

const Trips = {
    data() {
        return {
            trips: [],
            showModal: false,
            isEditing: false,
            selectedId: null,
            searchQuery: '',
            filterDate: '',
            filterFactory: '',
            filterCarrier: '',
            form: { id: null, doc_num: '', date: '', driver: '', truck: '', carrier: '', factory: '', capacity: '' }
        };
    },
    computed: {
        filteredTrips() {
            return this.trips.filter(t => {
                const matchSearch = t.driver.includes(this.searchQuery) || t.doc_num.includes(this.searchQuery) || t.truck.includes(this.searchQuery);
                const matchDate = this.filterDate ? t.date === this.filterDate : true;
                const matchFactory = this.filterFactory ? t.factory.includes(this.filterFactory) : true;
                const matchCarrier = this.filterCarrier ? t.carrier.includes(this.filterCarrier) : true;
                return matchSearch && matchDate && matchFactory && matchCarrier;
            });
        }
    },
    methods: {
        autoFillDriver() {
            const data = driversDatabase[this.form.driver];
            if (data) {
                this.form.truck = data.truck_number;
                this.form.carrier = data.carrier_name;
                this.form.capacity = data.capacity;
            } else {
                this.form.truck = '';
                this.form.carrier = '';
                this.form.capacity = '';
            }
        },
        openAddModal() {
            this.form = { id: Date.now(), doc_num: '', date: '', driver: '', truck: '', carrier: '', factory: '', capacity: '' };
            this.isEditing = false;
            this.showModal = true;
        },
        openEditModal() {
            if (!this.selectedId) return alert('يرجى تحديد صف للتعديل');
            const item = this.trips.find(e => e.id === this.selectedId);
            this.form = { ...item };
            this.isEditing = true;
            this.showModal = true;
        },
        saveTrip() {
            if (this.isEditing) {
                const index = this.trips.findIndex(e => e.id === this.form.id);
                this.trips[index] = { ...this.form };
            } else {
                this.trips.push({ ...this.form });
            }
            this.showModal = false;
            this.selectedId = null;
        },
        deleteTrip() {
            if (!this.selectedId) return alert('يرجى تحديد صف للحذف');
            if (confirm('هل تريد حذف هذه النقلة؟')) {
                this.trips = this.trips.filter(e => e.id !== this.selectedId);
                this.selectedId = null;
            }
        },
        selectRow(id) {
            this.selectedId = id;
        },
        exportData() {
            const headers = ['رقم المستند', 'التاريخ', 'السائق', 'رقم السيارة', 'الناقل', 'المعمل', 'الحمولة'];
            const rows = this.filteredTrips.map(e => [e.doc_num, e.date, e.driver, e.truck, e.carrier, e.factory, e.capacity]);
            exportToExcel('النقلات', headers, rows);
        }
    },
    template: `
        <div class="generic-section">
            <h2>إدارة النقلات</h2>
            
            <div class="filters-box">
                <input type="text" v-model="searchQuery" placeholder="بحث (سائق, مستند, سيارة)...">
                <label>التاريخ:</label> <input type="date" v-model="filterDate">
                <label>المعمل:</label> <input type="text" v-model="filterFactory">
                <label>الناقل:</label> <input type="text" v-model="filterCarrier">
            </div>

            <div class="action-bar">
                <button class="btn-success" @click="openAddModal">إضافة نقلة</button>
                <button class="btn-warning" @click="openEditModal">تعديل</button>
                <button class="btn-danger" @click="deleteTrip">حذف</button>
                <button class="btn-primary" @click="exportData">تصدير Excel</button>
            </div>

            <table>
                <tr>
                    <th>رقم المستند</th><th>التاريخ</th><th>السائق</th><th>رقم السيارة</th>
                    <th>الناقل</th><th>المعمل</th><th>الحمولة</th>
                </tr>
                <tr v-for="t in filteredTrips" :key="t.id" @click="selectRow(t.id)" :class="{'selected-row': selectedId === t.id}">
                    <td>{{ t.doc_num }}</td><td>{{ t.date }}</td><td>{{ t.driver }}</td>
                    <td>{{ t.truck }}</td><td>{{ t.carrier }}</td><td>{{ t.factory }}</td><td>{{ t.capacity }}</td>
                </tr>
            </table>

            <div v-if="showModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>{{ isEditing ? 'تعديل نقلة' : 'إضافة نقلة' }}</h3>
                    <div class="form-group"><label>رقم المستند</label><input type="text" v-model="form.doc_num"></div>
                    <div class="form-group"><label>التاريخ</label><input type="date" v-model="form.date"></div>
                    <div class="form-group">
                        <label>اسم السائق</label>
                        <input type="text" v-model="form.driver" @input="autoFillDriver">
                    </div>
                    <div class="form-group"><label>المعمل</label><input type="text" v-model="form.factory"></div>
                    <div class="form-group"><label>رقم السيارة</label><input type="text" v-model="form.truck" readonly></div>
                    <div class="form-group"><label>اسم الناقل</label><input type="text" v-model="form.carrier" readonly></div>
                    <div class="form-group"><label>الحمولة</label><input type="text" v-model="form.capacity" readonly></div>
                    <div class="modal-actions">
                        <button class="btn-success" @click="saveTrip">حفظ</button>
                        <button class="btn-danger" @click="showModal = false">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

const Carriers = {
    data() {
        return {
            carriers: [],
            showModal: false,
            form: { name: '', phone: '', cars: [] },
            carForm: { truck: '', driver: '', capacity: '' }
        };
    },
    methods: {
        openAddModal() {
            this.form = { name: '', phone: '', cars: [] };
            this.showModal = true;
        },
        addCar() {
            this.form.cars.push({ ...this.carForm });
            this.carForm = { truck: '', driver: '', capacity: '' };
        },
        save() {
            this.carriers.push({ ...this.form });
            this.showModal = false;
        }
    },
    template: `
        <div class="generic-section">
            <h2>إدارة الناقلين</h2>
            <div class="action-bar">
                <button class="btn-success" @click="openAddModal">إضافة ناقل</button>
            </div>
            <table>
                <tr><th>اسم الناقل</th><th>رقم الهاتف</th><th>عدد السيارات</th></tr>
                <tr v-for="c in carriers">
                    <td>{{ c.name }}</td><td>{{ c.phone }}</td><td>{{ c.cars.length }}</td>
                </tr>
            </table>
            <div v-if="showModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>إضافة ناقل</h3>
                    <div class="form-group"><label>اسم الناقل</label><input type="text" v-model="form.name"></div>
                    <div class="form-group"><label>رقم الهاتف</label><input type="text" v-model="form.phone"></div>
                    <hr>
                    <h4>سيارات الناقل</h4>
                    <div class="filters-box">
                        <input type="text" placeholder="رقم السيارة" v-model="carForm.truck">
                        <input type="text" placeholder="السائق" v-model="carForm.driver">
                        <input type="text" placeholder="الحمولة" v-model="carForm.capacity">
                        <button class="btn-primary" @click="addCar">إضافة سيارة</button>
                    </div>
                    <ul>
                        <li v-for="car in form.cars">{{ car.truck }} - {{ car.driver }} - {{ car.capacity }}</li>
                    </ul>
                    <div class="modal-actions">
                        <button class="btn-success" @click="save">حفظ</button>
                        <button class="btn-danger" @click="showModal = false">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

const CompanyTrucks = {
    data() {
        return {
            trucks: [],
            showModal: false,
            form: { truck: '', driver: '', capacity: '' }
        };
    },
    methods: {
        save() {
            this.trucks.push({ ...this.form });
            this.showModal = false;
        }
    },
    template: `
        <div class="generic-section">
            <h2>سيارات الشركة</h2>
            <div class="action-bar">
                <button class="btn-success" @click="showModal = true; form={truck:'', driver:'', capacity:''}">إضافة سيارة</button>
            </div>
            <table>
                <tr><th>رقم السيارة</th><th>اسم السائق</th><th>الحمولة</th></tr>
                <tr v-for="t in trucks"><td>{{ t.truck }}</td><td>{{ t.driver }}</td><td>{{ t.capacity }}</td></tr>
            </table>
            <div v-if="showModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>إضافة سيارة</h3>
                    <div class="form-group"><label>رقم السيارة</label><input type="text" v-model="form.truck"></div>
                    <div class="form-group"><label>اسم السائق</label><input type="text" v-model="form.driver"></div>
                    <div class="form-group"><label>الحمولة</label><input type="text" v-model="form.capacity"></div>
                    <div class="modal-actions">
                        <button class="btn-success" @click="save">حفظ</button>
                        <button class="btn-danger" @click="showModal = false">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

const Factories = {
    data() {
        return {
            factories: [],
            showModal: false,
            form: { name: '', qty: '', price: '', type: 'للطن' }
        };
    },
    methods: {
        save() {
            this.factories.push({ ...this.form });
            this.showModal = false;
        }
    },
    template: `
        <div class="generic-section">
            <h2>المعامل</h2>
            <div class="action-bar">
                <button class="btn-success" @click="showModal = true; form={name:'', qty:'', price:'', type:'للطن'}">إضافة معمل</button>
            </div>
            <table>
                <tr><th>اسم المعمل</th><th>الكمية الشهرية</th><th>السعر</th><th>نوع السعر</th></tr>
                <tr v-for="f in factories"><td>{{ f.name }}</td><td>{{ f.qty }}</td><td>{{ f.price }}</td><td>{{ f.type }}</td></tr>
            </table>
            <div v-if="showModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>إضافة معمل</h3>
                    <div class="form-group"><label>اسم المعمل</label><input type="text" v-model="form.name"></div>
                    <div class="form-group"><label>الكمية الشهرية</label><input type="text" v-model="form.qty"></div>
                    <div class="form-group"><label>السعر</label><input type="text" v-model="form.price"></div>
                    <div class="form-group">
                        <label>نوع السعر</label>
                        <select v-model="form.type">
                            <option value="للطن">للطن</option>
                            <option value="للتر">للتر</option>
                            <option value="للنقلة">للنقلة</option>
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-success" @click="save">حفظ</button>
                        <button class="btn-danger" @click="showModal = false">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

const Invoices = {
    data() {
        return {
            invoices: [],
            showModal: false,
            form: { target: '', period: '', trips: 0, qty: 0, amount: 0, type: 'فاتورة معمل' }
        };
    },
    methods: {
        calc() {
            this.form.trips = Math.floor(Math.random() * 10) + 1;
            this.form.qty = this.form.trips * 36000;
            this.form.amount = this.form.qty * 10;
        },
        save() {
            this.invoices.push({ ...this.form });
            this.showModal = false;
        }
    },
    template: `
        <div class="generic-section">
            <h2>الفواتير</h2>
            <div class="action-bar">
                <button class="btn-success" @click="showModal = true; form={target:'', period:'', trips:0, qty:0, amount:0, type:'فاتورة معمل'}">إنشاء فاتورة</button>
            </div>
            <table>
                <tr><th>النوع</th><th>الجهة</th><th>الفترة</th><th>عدد النقلات</th><th>الكمية</th><th>المبلغ</th></tr>
                <tr v-for="i in invoices"><td>{{ i.type }}</td><td>{{ i.target }}</td><td>{{ i.period }}</td><td>{{ i.trips }}</td><td>{{ i.qty }}</td><td>{{ i.amount }}</td></tr>
            </table>
            <div v-if="showModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>إنشاء فاتورة</h3>
                    <div class="form-group">
                        <label>نوع الفاتورة</label>
                        <select v-model="form.type"><option value="فاتورة معمل">فاتورة معمل</option><option value="فاتورة ناقل">فاتورة ناقل</option></select>
                    </div>
                    <div class="form-group"><label>الجهة (المعمل / الناقل)</label><input type="text" v-model="form.target"></div>
                    <div class="form-group"><label>الفترة الزمنية</label><input type="text" v-model="form.period" @input="calc"></div>
                    <hr>
                    <p>عدد النقلات: {{ form.trips }}</p>
                    <p>الكمية: {{ form.qty }}</p>
                    <p>المبلغ: {{ form.amount }}</p>
                    <div class="modal-actions">
                        <button class="btn-success" @click="save">حفظ</button>
                        <button class="btn-danger" @click="showModal = false">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

const Advances = {
    data() {
        return {
            advances: [],
            showModal: false,
            form: { driver: '', doc_num: '', factory: '', amount: '', date: '' }
        };
    },
    methods: {
        save() {
            this.advances.push({ ...this.form });
            this.showModal = false;
        }
    },
    template: `
        <div class="generic-section">
            <h2>السلف</h2>
            <div class="action-bar">
                <button class="btn-success" @click="showModal = true; form={driver:'', doc_num:'', factory:'', amount:'', date:''}">إضافة سلفة</button>
            </div>
            <table>
                <tr><th>اسم السائق</th><th>رقم المستند</th><th>المعمل</th><th>المبلغ</th><th>التاريخ</th></tr>
                <tr v-for="a in advances"><td>{{ a.driver }}</td><td>{{ a.doc_num }}</td><td>{{ a.factory }}</td><td>{{ a.amount }}</td><td>{{ a.date }}</td></tr>
            </table>
            <div v-if="showModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>تسجيل سلفة</h3>
                    <div class="form-group"><label>اسم السائق</label><input type="text" v-model="form.driver"></div>
                    <div class="form-group"><label>رقم المستند</label><input type="text" v-model="form.doc_num"></div>
                    <div class="form-group"><label>المعمل</label><input type="text" v-model="form.factory"></div>
                    <div class="form-group"><label>مبلغ السلفة</label><input type="text" v-model="form.amount"></div>
                    <div class="form-group"><label>التاريخ</label><input type="date" v-model="form.date"></div>
                    <div class="modal-actions">
                        <button class="btn-success" @click="save">حفظ</button>
                        <button class="btn-danger" @click="showModal = false">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

const Cashbox = {
    data() {
        return {
            records: [],
            showModal: false,
            form: { type: 'وارد', amount: '', notes: '' }
        };
    },
    methods: {
        save() {
            this.records.push({ ...this.form });
            this.showModal = false;
        }
    },
    template: `
        <div class="generic-section">
            <h2>الصندوق</h2>
            <div class="action-bar">
                <button class="btn-success" @click="showModal = true; form={type:'وارد', amount:'', notes:''}">إضافة وارد</button>
                <button class="btn-danger" @click="showModal = true; form={type:'صادر', amount:'', notes:''}">إضافة صادر</button>
            </div>
            <table>
                <tr><th>النوع</th><th>المبلغ</th><th>الملاحظات</th></tr>
                <tr v-for="r in records"><td>{{ r.type }}</td><td>{{ r.amount }}</td><td>{{ r.notes }}</td></tr>
            </table>
            <div v-if="showModal" class="modal-overlay">
                <div class="modal-content">
                    <h3>العملية</h3>
                    <div class="form-group"><label>النوع</label><input type="text" v-model="form.type" readonly></div>
                    <div class="form-group"><label>المبلغ</label><input type="number" v-model="form.amount"></div>
                    <div class="form-group"><label>الملاحظات</label><textarea v-model="form.notes"></textarea></div>
                    <div class="modal-actions">
                        <button class="btn-success" @click="save">حفظ</button>
                        <button class="btn-danger" @click="showModal = false">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    `
};

const Reports = {
    template: `
        <div class="generic-section">
            <h2>التقارير</h2>
            <div class="filters-box">
                <label>فلترة تاريخ:</label> <input type="date">
            </div>
            <div class="action-bar">
                <button class="btn-primary">تصدير Excel</button>
                <button class="btn-warning">طباعة</button>
            </div>
            <ul>
                <li>تقرير النقلات اليومية</li>
                <li>تقرير النقلات الشهرية</li>
                <li>تقرير المعامل</li>
                <li>تقرير الناقلين</li>
                <li>تقرير السلف</li>
                <li>تقرير الأرباح</li>
            </ul>
        </div>
    `
};

const Documents = { template: `<div class="generic-section"><h2>وثائق سيارات الشركة</h2></div>` };

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
