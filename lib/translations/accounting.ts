const accountingTranslations = {
  ar: {
    accounting: {
      // ============================================
      // Common / Shared
      // ============================================
      common: {
        currency: 'ج.م',
        currencySAR: 'ر.س',
        currencyUSD: '$',
        loading: 'جاري التحميل...',
        saving: 'جاري الحفظ...',
        deleting: 'جاري الحذف...',
        saved: 'تم الحفظ',
        save: 'حفظ',
        saveChanges: 'حفظ التغييرات',
        cancel: 'إلغاء',
        delete: 'حذف',
        edit: 'تعديل',
        add: 'إضافة',
        close: 'إغلاق',
        retry: 'إعادة المحاولة',
        refresh: 'تحديث',
        search: 'بحث',
        back: 'العودة',
        yes: 'نعم',
        no: 'لا',
        openMenu: 'فتح القائمة',
        closeMenu: 'إغلاق القائمة',
        open: 'فتح',
        noData: 'لا توجد بيانات',
        active: 'نشط',
        inactive: 'غير نشط',
        disabled: 'معطلة',
        night: 'ليلة',
        booking: 'حجز',
        expense: 'مصروف',
        investor: 'مستثمر',
        apartment: 'شقة',
        item: 'عنصر',
        record: 'سجل',
        operation: 'عملية',
        readOnly: 'للقراءة فقط',
        by: 'بواسطة',
        choose: 'اختر...',
        example: 'مثال:',
        optional: 'اختياري',
        required: 'مطلوب',
        confirm: 'تأكيد',
        confirmAction: 'تأكيد الإجراء',
        confirmActionMessage: 'هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع عنه.',
        confirmDelete: 'تأكيد الحذف',
        processing: 'جاري...',
        noProject: 'بدون مشروع',
        floor: 'الدور',
        floorN: (n: number) => `الدور ${n}`,
        autoCalculated: 'محسوب تلقائياً',
        showCharts: 'إظهار الرسوم البيانية',
        hideCharts: 'إخفاء الرسوم البيانية',
        showFilters: 'إظهار الفلاتر',
        hideFilters: 'إخفاء الفلاتر',
        activeFilters: 'فلاتر نشطة',
        showing100of: (n: number) => `يُعرض أول 100 عنصر من ${n}`,
        ofNApartments: (n: number) => `من ${n} شقة`,
      },

      // ============================================
      // Error Messages
      // ============================================
      errors: {
        generic: 'حدث خطأ',
        unexpected: 'حدث خطأ غير متوقع',
        fetchData: 'حدث خطأ أثناء جلب البيانات',
        saveFailed: 'حدث خطأ أثناء الحفظ',
        deleteFailed: 'حدث خطأ أثناء الحذف',
        connectionFailed: 'فشل الاتصال بالخادم',
        connectionError: 'حدث خطأ في الاتصال',
        fetchApartments: 'خطأ في جلب الشقق',
        fetchProjects: 'خطأ في جلب المشاريع',
        createApartment: 'خطأ في إنشاء الشقة',
        editApartment: 'خطأ في تعديل الشقة',
        fetchBookings: 'خطأ في جلب الحجوزات',
        fetchExpenses: 'خطأ في جلب المصروفات',
        fetchInvestorData: 'فشل في جلب البيانات',
        fetchApartmentData: 'خطأ في جلب بيانات الشقة',
        fetchCustody: 'خطأ في جلب البيانات',
        fetchMonthStatus: 'فشل في تحميل حالة الشهر',
        fetchAuditLogs: 'فشل في تحميل السجلات',
        fetchBackup: 'فشل في جلب النسخة الاحتياطية',
        fetchFailed: 'فشل في جلب البيانات',
        saveFetchFailed: 'فشل في الحفظ',
        deleteFetchFailed: 'فشل في الحذف',
        assignError: 'حدث خطأ في الربط',
        withdrawalError: 'حدث خطأ في تسجيل المسحوبة',
        deleteError: 'حدث خطأ في الحذف',
        backupCreateFailed: 'فشل في إنشاء النسخة الاحتياطية',
        resetFailed: 'فشلت العملية',
        loadInvestmentData: 'حدث خطأ في تحميل البيانات',
        allFieldsRequired: 'جميع الحقول مطلوبة',
        percentRange: 'النسبة يجب أن تكون بين 1% و 100%',
        selectApartmentAndInvestor: 'يجب اختيار الشقة والمستثمر وتحديد النسبة',
        amountMustBePositive: 'المبلغ يجب أن يكون أكبر من صفر',
        selectApartmentAmountDate: 'يجب اختيار الشقة وتحديد المبلغ والتاريخ',
        exchangeRateMustBePositive: 'سعر الصرف يجب أن يكون رقماً موجباً',
        supervisorExists: 'هذا المشرف موجود بالفعل',
        minOneSupervisor: 'يجب إضافة مشرف واحد على الأقل',
      },

      // ============================================
      // Success Messages
      // ============================================
      success: {
        bookingUpdated: 'تم تحديث الحجز بنجاح',
        bookingAdded: 'تم إضافة الحجز بنجاح',
        bookingDeleted: 'تم حذف الحجز بنجاح',
        expenseUpdated: 'تم تحديث المصروف بنجاح',
        expenseAdded: 'تم إضافة المصروف بنجاح',
        expenseDeleted: 'تم حذف المصروف بنجاح',
        locked: 'تم القفل بنجاح',
        unlocked: 'تم فتح القفل',
        systemReset: 'تمت تصفية النظام بالكامل بنجاح',
        deleted: (name: string) => `تم حذف "${name}"`,
      },

      // ============================================
      // Months
      // ============================================
      months: [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ] as readonly string[],

      monthSelector: {
        prevMonth: 'الشهر السابق',
        nextMonth: 'الشهر التالي',
      },

      // ============================================
      // Booking Sources
      // ============================================
      bookingSources: {
        EXTERNAL: 'خارجي',
        DIRECT: 'مباشر',
        OTHER: 'أخرى',
      },

      bookingSourceFilters: {
        all: 'كل المصادر',
        EXTERNAL: 'خارجي',
        DIRECT: 'مباشر',
        OTHER: 'أخرى',
      },

      // ============================================
      // Booking Statuses
      // ============================================
      bookingStatuses: {
        CONFIRMED: 'مؤكد',
        PENDING: 'معلّق',
        COMPLETED: 'مكتمل',
        CHECKED_IN: 'دخل',
        CHECKED_OUT: 'خرج',
        CANCELLED: 'ملغي',
      },

      bookingStatusFilters: {
        all: 'كل الحالات',
        CONFIRMED: 'مؤكد',
        CHECKED_IN: 'دخل',
        CHECKED_OUT: 'خرج',
        CANCELLED: 'ملغي',
      },

      // ============================================
      // Expense Categories (full labels)
      // ============================================
      expenseCategories: {
        CLEANING: 'تنظيف الشقة',
        INTERNET: 'انترنت',
        WATER: 'مياه',
        GAS: 'غاز',
        ELECTRICITY: 'كهرباء',
        MAINTENANCE: 'صيانة',
        SUPPLIES: 'مستلزمات',
        FURNITURE: 'أثاث',
        LAUNDRY: 'غسيل ملاءات',
        TOWELS: 'مناشف حمام',
        KITCHEN_SUPPLIES: 'مستلزمات المطبخ',
        AIR_CONDITIONING: 'تكييف',
        OTHER: 'أخرى',
      },

      // Short category labels for charts/dashboard
      expenseCategoriesShort: {
        CLEANING: 'نظافة',
        MAINTENANCE: 'صيانة',
        ELECTRICITY: 'كهرباء',
        WATER: 'مياه',
        GAS: 'غاز',
        INTERNET: 'إنترنت',
        FURNITURE: 'أثاث',
        SUPPLIES: 'مستلزمات',
        LAUNDRY: 'ملاءات',
        TOWELS: 'مناشف',
        KITCHEN_SUPPLIES: 'مطبخ',
        AIR_CONDITIONING: 'تكييف',
        OTHER: 'أخرى',
      },

      // ============================================
      // Roles
      // ============================================
      roles: {
        ADMIN: 'مسؤول الموقع و مدير عام',
        GENERAL_MANAGER: 'المدير العام',
        OPS_MANAGER: 'مدير التشغيل',
        BOOKING_MANAGER: 'مدير الحجوزات',
        INVESTOR: 'مستثمر',
      },

      // ============================================
      // Sidebar
      // ============================================
      sidebar: {
        dashboard: 'لوحة التحكم',
        apartments: 'الشقق',
        bookings: 'الحجوزات',
        expenses: 'المصروفات',
        custody: 'العهدة',
        daily: 'المتابعة اليومية',
        investors: 'المستثمرين',
        myInvestments: 'حساباتي',
        reports: 'التقارير',
        monthLock: 'قفل الأشهر',
        audit: 'سجل المراجعة',
        settings: 'الإعدادات',
        backToMain: 'العودة للصفحة الرئيسية',
        logout: 'تسجيل الخروج',
      },

      // ============================================
      // Dashboard
      // ============================================
      dashboard: {
        title: 'لوحة التحكم',
        subtitle: 'نظرة عامة على الحسابات',
        totalRevenue: 'إجمالي الإيرادات',
        totalExpenses: 'إجمالي المصروفات',
        netProfit: 'صافي الربح',
        bookingsCount: 'عدد الحجوزات',
        apartmentsCount: 'عدد الشقق',
        occupancyRate: 'نسبة الإشغال',
        pendingApproval: 'بانتظار الموافقة',
        revenueExpenses12Months: 'الإيرادات والمصروفات (آخر 12 شهر)',
        expensesByCategory: 'توزيع المصروفات حسب القسم',
        bookingSources: 'مصادر الحجوزات',

        revenue: 'الإيرادات',
        expensesLabel: 'المصروفات',
        profit: 'الربح',
        noDataToShow: 'لا توجد بيانات للعرض',

        // Recent sections
        recentBookings: 'آخر الحجوزات',
        recentExpenses: 'آخر المصروفات',
        noBookingsYet: 'لا توجد حجوزات بعد',
        noExpensesYet: 'لا توجد مصروفات بعد',
        noBookingsThisMonth: 'لا توجد حجوزات هذا الشهر',
        noExpensesThisMonth: 'لا توجد مصروفات هذا الشهر',

        // Daily Alerts
        todayAlerts: 'تنبيهات اليوم',
        event: 'حدث',
        noEventsToday: 'لا توجد أحداث اليوم',
        checkIn: 'دخول',
        checkOut: 'خروج',

        // Chart labels
        amount: 'المبلغ:',
        bookingsLabel: 'الحجوزات:',

        // Dashboard booking status (different from main statuses)
        statusConfirmed: 'مؤكد',
        statusPending: 'معلّق',
        statusCancelled: 'ملغي',
        statusCompleted: 'مكتمل',
      },

      // ============================================
      // Apartments Page 
      // ============================================
      apartments: {
        title: 'الشقق',
        subtitle: 'إدارة الشقق والمشاريع',
        addApartment: 'إضافة شقة',
        searchPlaceholder: 'بحث بالاسم...',
        allProjects: 'كل المشاريع',
        noApartmentsFilter: 'لا توجد شقق مطابقة للفلتر',
        noApartments: 'لا توجد شقق بعد',
        addFirstApartment: 'إضافة أول شقة',
        apartmentUnit: 'شقة',
        apartmentNotFound: 'الشقة غير موجودة',
        backToApartments: 'العودة للشقق',

        // Financial summary
        totalRevenue: 'إجمالي الإيرادات',
        totalExpenses: 'إجمالي المصروفات',
        netProfit: 'صافي الربح',
        bookingsCount: 'عدد الحجوزات',
        nightsBooked: 'الليالي المحجوزة',

        // Bookings table
        bookingsRevenue: 'الحجوزات (الإيرادات)',
        noBookingsThisMonth: 'لا توجد حجوزات هذا الشهر',
        
        // Expenses table
        expensesTitle: 'المصروفات',
        noExpensesThisMonth: 'لا توجد مصروفات هذا الشهر',
        
        // Investors table
        investorsTable: 'جدول المستثمرين',
        totalPercentages: 'إجمالي النسب:',
        noInvestors: 'لا يوجد مستثمرين لهذه الشقة',

        // Table headers
        client: 'العميل',
        checkInDate: 'الدخول',
        checkOutDate: 'الخروج',
        nights: 'الليالي',
        amountHeader: 'المبلغ',
        source: 'المصدر',
        status: 'الحالة',
        description: 'الوصف',
        category: 'القسم',
        date: 'التاريخ',
        name: 'الاسم',
        percentage: 'النسبة',
        profitHeader: 'الربح',
        withdrawals: 'المسحوبات',
        remaining: 'المتبقي',
      },

      // ============================================
      // Apartment Form
      // ============================================
      apartmentForm: {
        editTitle: 'تعديل الشقة',
        addTitle: 'إضافة شقة جديدة',
        project: 'المشروع',
        selectProject: 'اختر المشروع',
        noProjects: 'لا يوجد مشاريع حتى الآن',
        apartmentName: 'اسم الشقة',
        namePlaceholder: 'مثال: المنيل - الدور الخامس',
        floorNumber: 'رقم الدور',
        floorPlaceholder: 'مثال: 5',
        apartmentType: 'نوع الشقة',
        typePlaceholder: 'مثال: بانوراما',
        saveEdit: 'حفظ التعديلات',
        addApartment: 'إضافة الشقة',
        nameRequired: 'اسم الشقة مطلوب',
        projectRequired: 'يجب اختيار المشروع',
      },

      // ============================================
      // Bookings Page
      // ============================================
      bookings: {
        title: 'الحجوزات',
        subtitle: 'إدارة الحجوزات والإشغال',
        altSubtitle: 'شيت الإيرادات والحجوزات',
        addBooking: 'إضافة حجز',
        searchPlaceholder: 'بحث بالاسم أو رقم الهاتف...',
        allApartments: 'كل الشقق',
        deleteBooking: 'حذف الحجز؟',
        deleteConfirm: (name: string) => `سيتم حذف حجز "${name}" بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.`,

        // Booking summary
        totalRevenue: 'إجمالي الإيرادات',
        bookingsCount: 'عدد الحجوزات',
        nightsBooked: 'الليالي المحجوزة',
        avgNightRate: 'متوسط الليلة',
        activeApartments: 'شقق نشطة',

        // Booking list
        bookingsList: 'قائمة الحجوزات',
        noBookingsFilter: 'لا توجد حجوزات بهذا الفلتر',

        // Table headers
        apartment: 'الشقة',
        client: 'العميل',
        checkIn: 'الدخول',
        checkOut: 'الخروج',
        nights: 'الليالي',
        amount: 'المبلغ',
        source: 'المصدر',
        status: 'الحالة',
        actions: 'إجراء',

        // Charts
        sourceDistribution: 'توزيع الحجوزات حسب المصدر',
        apartmentRevenueComparison: 'مقارنة إيرادات الشقق',
      },

      // ============================================
      // Booking Form
      // ============================================
      bookingForm: {
        editTitle: 'تعديل الحجز',
        addTitle: 'إضافة حجز جديد',
        apartment: 'الشقة',
        selectApartment: 'اختر الشقة',
        noApartments: 'لا يوجد شقق حتى الآن',
        clientName: 'اسم العميل',
        guestName: 'اسم الضيف',
        contactNumber: 'رقم التواصل',
        bookingSource: 'مصدر الحجز',
        checkInDate: 'تاريخ الدخول',
        checkOutDate: 'تاريخ الخروج',
        nightsCount: 'عدد الليالي',
        financialValue: 'القيمة المالية',
        arrivalTime: 'وقت الوصول',
        status: 'الحالة',
        notes: 'ملاحظات',
        notesPlaceholder: 'ملاحظات إضافية...',
        saveEdit: 'حفظ التعديلات',
        saveBooking: 'حفظ الحجز',

        // Validation
        apartmentRequired: 'يجب اختيار الشقة',
        clientNameRequired: 'اسم العميل مطلوب',
        checkInRequired: 'تاريخ الدخول مطلوب',
        checkOutRequired: 'تاريخ الخروج مطلوب',
        checkOutAfterCheckIn: 'تاريخ الخروج يجب أن يكون بعد تاريخ الدخول',
        amountMustBePositive: 'القيمة المالية يجب أن تكون أكبر من 0',
      },

      // ============================================
      // Expenses Page
      // ============================================
      expenses: {
        title: 'المصروفات',
        subtitle: 'شيت المصروفات حسب الشقة',
        addExpense: 'إضافة مصروف',
        searchPlaceholder: 'بحث بالوصف أو الملاحظات...',
        allApartments: 'كل الشقق',
        allCategories: 'كل الأقسام',
        deleteExpense: 'حذف المصروف؟',
        deleteConfirm: (name: string) => `سيتم حذف "${name}" بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.`,

        // Expense summary
        totalExpenses: 'إجمالي المصروفات',
        expenseCount: 'عدد المصروفات',
        avgExpense: 'متوسط المصروف',
        apartmentsWithExpenses: 'شقق بمصروفات',
        topCategory: 'أعلى قسم',

        // Expense list
        expensesList: 'قائمة المصروفات',
        noExpensesFilter: 'لا توجد مصروفات بهذا الفلتر',

        // Charts
        categoryDistribution: 'توزيع المصروفات حسب القسم',
        apartmentComparison: 'مقارنة مصروفات الشقق',

        // Table headers
        apartment: 'الشقة',
        description: 'الوصف',
        category: 'القسم',
        date: 'التاريخ',
        amount: 'المبلغ',
        actions: 'إجراء',

        amountLabel: 'المبلغ:',
        countLabel: 'العدد:',

        // Approval
        allStatuses: 'كل الحالات',
        statusPENDING: 'بانتظار الاعتماد',
        statusAPPROVED: 'معتمد',
        statusREJECTED: 'مرفوض',
        approve: 'اعتماد',
        reject: 'رفض',
        rejectionReasonTitle: 'سبب الرفض',
        rejectionReasonPlaceholder: 'اكتب سبب رفض المصروف...',
        rejectionReasonRequired: 'يجب ذكر سبب الرفض',
        approveConfirm: 'تأكيد الاعتماد',
        approveConfirmMsg: 'هل تريد اعتماد هذا المصروف؟',
        approvedSuccess: 'تم اعتماد المصروف',
        rejectedSuccess: 'تم رفض المصروف',
        status: 'الحالة',
      },

      // ============================================
      // Expense Form
      // ============================================
      expenseForm: {
        editTitle: 'تعديل المصروف',
        addTitle: 'إضافة مصروف جديد',
        apartment: 'الشقة',
        selectApartment: 'اختر الشقة',
        noApartments: 'لا يوجد شقق حتى الآن',
        description: 'الوصف',
        descriptionPlaceholder: 'مثال: تنظيف الشقة بعد خروج الضيف',
        category: 'القسم',
        amount: 'المبلغ',
        date: 'التاريخ',
        notes: 'ملاحظات',
        notesPlaceholder: 'ملاحظات إضافية...',
        saveEdit: 'حفظ التعديلات',
        saveExpense: 'حفظ المصروف',

        // Validation
        apartmentRequired: 'يجب اختيار الشقة',
        descriptionRequired: 'الوصف مطلوب',
        categoryRequired: 'يجب اختيار القسم',
        amountMustBePositive: 'المبلغ يجب أن يكون أكبر من 0',
        dateRequired: 'التاريخ مطلوب',
      },

      // ============================================
      // Custody Page
      // ============================================
      custody: {
        title: 'العهدة',
        subtitleAdmin: 'إدارة عُهَد مديري التشغيل',
        subtitleUser: 'العُهَد المسلّمة إليك',
        newCustody: 'عهدة جديدة',
        totalCustody: 'إجمالي العُهَد',
        spent: 'المصروف',
        remaining: 'المتبقي',
        noCustody: 'لا توجد عُهَد مسجّلة',
        locked: 'مُقفَلة',
        unlocked: 'مفتوحة',
        custodyLabel: 'العهدة',

        // New custody form
        newCustodyTitle: 'عهدة جديدة',
        opsManager: 'مدير التشغيل *',
        noManagers: 'لا يوجد مديرين حتى الآن',
        apartmentLabel: 'الشقة *',
        noApartments: 'لا يوجد شقق حتى الآن',
        amountLabel: (currency: string) => `المبلغ (${currency}) *`,
        monthLabel: 'الشهر *',
        notesLabel: 'ملاحظات',
        createCustody: 'إنشاء العهدة',
      },

      // ============================================
      // Daily Schedule Page
      // ============================================
      daily: {
        title: 'جدول المتابعة اليومية',
        subtitle: 'متابعة حركة الدخول والخروج للشقق',
        today: 'اليوم',
        tomorrow: 'غداً',
        tomorrowAutoNote: 'يعرض جدول الغد تلقائياً (بعد 7 مساءً)',
        autoUpdateNote: 'يتم التحديث الساعة 7:00 مساءً',
        backToAutoDate: 'العودة للتاريخ التلقائي',
        checkInsTitle: 'حجوزات الدخول',
        checkOutsTitle: 'حجوزات الخروج',
        noActivity: 'لا يوجد حركة دخول أو خروج في هذا اليوم',

        // Check-in/out tables
        loadingCheckIn: 'جاري تحميل بيانات الدخول...',
        loadingCheckOut: 'جاري تحميل بيانات الخروج...',
        checkInTitle: 'تسجيل الدخول',
        checkOutTitle: 'تسجيل الخروج',
        noCheckIns: 'لا يوجد حجوزات دخول لهذا اليوم',
        noCheckOuts: 'لا يوجد حجوزات خروج لهذا اليوم',

        // Table headers
        apartment: 'الشقة',
        guest: 'الضيف',
        contact: 'التواصل',
        arrival: 'الوصول',
        departure: 'الخروج',
        nights: 'الليالي',
        receptionSupervisor: 'مشرف الاستقبال',
        deliverySupervisor: 'مشرف الاستلام',

        // Supervisor select
        selectSupervisor: 'اختر مشرف',
        customName: 'اسم مخصص...',
      },

      // ============================================
      // Investors Page
      // ============================================
      investors: {
        title: 'إدارة المستثمرين',
        subtitle: 'المستثمرين ونسبهم ومسحوباتهم',
        assignInvestor: 'ربط مستثمر بشقة',
        searchPlaceholder: 'بحث بالاسم أو البريد...',
        investorUnit: 'مستثمر',
        investmentUnit: 'استثمار',
        
        // Edit percentage modal
        editPercentage: 'تعديل النسبة',
        percentageLabel: 'النسبة (%)',
        yearlyTarget: 'الهدف السنوي',
        saveEdit: 'حفظ التعديلات',

        // Remove confirm
        confirmRemove: 'تأكيد الإزالة',
        confirmRemoveMessage: (name: string, apartment: string) => `هل تريد إزالة ${name} من الشقة ${apartment}؟ هذا الإجراء لا يمكن التراجع عنه.`,
        yesRemove: 'نعم، إزالة',

        // Investors list
        loadingInvestors: 'جاري تحميل المستثمرين...',
        noInvestors: 'لا يوجد مستثمرين مسجلين',
        addInvestorHint: 'أضف مستثمراً جديداً من زر "ربط مستثمر بشقة"',
        apartmentUnit: 'شقة',
        registerWithdrawal: 'تسجيل سحب أرباح',
        viewFinancialDetails: 'عرض التفاصيل المالية',
        noLinkedInvestments: 'لا يوجد استثمارات مرتبطة',
        editPercentageAction: 'تعديل النسبة',
        removeFromApartment: 'إزالة من الشقة',
        yearlyTargetHeader: 'الهدف السنوي',
        withdrawalsHeader: 'المسحوبات',
        actionsHeader: 'إجراءات',
      },

      // ============================================
      // Investor Detail Page
      // ============================================
      investorDetail: {
        financialDetails: 'التفاصيل المالية',
        loadingData: 'جاري تحميل بيانات المستثمر...',
        investmentsCount: 'عدد الاستثمارات',
        noInvestments: 'لا يوجد استثمارات مرتبطة',
        investments: (n: number) => `الاستثمارات (${n})`,
      },

      // ============================================
      // Assign Investor Modal
      // ============================================
      assignInvestorModal: {
        title: 'ربط مستثمر بشقة',
        apartment: 'الشقة',
        selectApartment: 'اختر الشقة...',
        noApartments: 'لا يوجد شقق حتى الآن',
        investor: 'المستثمر',
        loadingInvestors: 'جاري تحميل المستثمرين...',
        selectInvestor: 'اختر المستثمر...',
        noInvestors: 'لا يوجد مستثمرين حتى الآن',
        percentage: 'النسبة (%)',
        percentagePlaceholder: 'مثال: 20',
        yearlyTarget: 'الهدف السنوي (اختياري)',
        yearlyTargetPlaceholder: 'مثال: 3000',
        assign: 'ربط المستثمر',
      },

      // ============================================
      // Withdrawal Form
      // ============================================
      withdrawalForm: {
        title: 'تسجيل سحب أرباح',
        apartmentInvestment: 'الشقة (الاستثمار)',
        selectApartment: 'اختر الشقة...',
        noInvestments: 'لا يوجد استثمارات حتى الآن',
        percentage: 'نسبة',
        amount: 'المبلغ',
        currency: 'العملة',
        withdrawalDate: 'تاريخ السحب',
        notes: 'ملاحظات (اختياري)',
        notesPlaceholder: 'وصف السحب...',
        submit: 'تسجيل سحب الأرباح',
      },

      // ============================================
      // Investor Portal (ApartmentView)
      // ============================================
      investorPortal: {
        myPercentage: 'نسبتي:',
        balance: 'الرصيد:',
        financialSummary: 'الملخص المالي',
        totalRevenue: 'إجمالي الإيرادات',
        totalExpenses: 'إجمالي المصروفات',
        netProfit: 'صافي الربح',
        myPercentageInApartment: 'نسبتي في هذه الشقة',
        yearlyProgress: 'التقدم السنوي',
        achieved: 'المحقق:',
        target: 'الهدف:',

        // Balance card
        finalBalance: 'الرصيد النهائي',
        accountSummary: 'ملخص الحساب الإجمالي',
        totalProfits: 'إجمالي الأرباح',
        totalWithdrawals: 'إجمالي المسحوبات',
        remainingBalance: 'الرصيد المتبقي',
        advanceBalance: 'سلفة (رصيد مدين)',

        // Monthly summary
        monthlyProfit: 'الربح الشهري',
        noDataThisYear: 'لا يوجد بيانات لهذه السنة',
        month: 'الشهر',
        revenue: 'الإيرادات',
        expenses: 'المصروفات',
        profit: 'الربح',
        myShare: 'حصتي',
        total: 'المجموع',

        // Withdrawals
        withdrawalsTitle: 'المسحوبات',
        loadingWithdrawals: 'جاري تحميل المسحوبات...',
        operationUnit: 'عملية',
        noWithdrawals: 'لا يوجد مسحوبات',
        withdrawalAmount: 'المبلغ',
        withdrawalDate: 'التاريخ',
        withdrawalApartment: 'الشقة',
        withdrawalNotes: 'ملاحظات',
        totalWithdrawalsLabel: 'إجمالي المسحوبات',
      },

      // ============================================
      // My Investments Page
      // ============================================
      myInvestments: {
        title: 'حساباتي',
        subtitle: 'استثماراتك وأرباحك ومسحوباتك',
        loadingData: 'جاري تحميل بيانات الاستثمار...',
        investmentsIn: (n: number) => `لديك استثمارات في ${n} شقة`,
        noInvestments: 'لا يوجد استثمارات مسجلة حالياً',
        contactAdmin: 'تواصل مع المدير العام لربط حسابك بشقة',
      },

      // ============================================
      // Reports Page
      // ============================================
      reports: {
        title: 'التقارير والملخصات',
        monthlySubtitle: 'ملخص شهري تفصيلي',
        yearlySubtitle: 'ملخص سنوي شامل',
        monthly: 'شهري',
        yearly: 'سنوي',

        // Charts
        apartmentComparison: 'مقارنة الشقق',
        occupancyPerApartment: 'نسبة الإشغال لكل شقة',
        expensesByCategory: 'توزيع المصروفات حسب القسم',
        bookingSources: 'مصادر الحجوزات',
        profitTrend: (year: number) => `اتجاه الأرباح - ${year}`,
        yearlyApartmentComparison: 'مقارنة الشقق (سنوي)',
        totalOccupancy: 'إجمالي الإشغال لكل شقة',

        // Occupancy chart
        busyNights: 'ليالي مشغولة:',
        occupancyRate: 'نسبة الإشغال:',
        occupancyCount: 'عدد الحجوزات:',
        noOccupancyData: 'لا توجد بيانات إشغال',
        busyNightsLegend: 'ليالي مشغولة',

        // Profit trend
        noTrendData: 'لا توجد بيانات كافية لعرض الاتجاه',

        // Comparison chart  
        noComparisonData: 'لا توجد بيانات للمقارنة',

        // Project summary
        aggregateSummary: 'الملخص التجميعي',
        allApartmentsTotal: 'إجمالي جميع الشقق',
        apartments: 'الشقق',
        noDataToShow: 'لا توجد بيانات لعرضها',
        margin: 'هامش',

        // Export
        downloadingPDF: 'جاري التحميل...',
        downloadPDF: 'تحميل PDF',
      },

      // ============================================
      // Month Lock Page
      // ============================================
      monthLock: {
        title: 'قفل الأشهر',
        subtitle: 'قفل الأشهر المالية لمنع التعديل وحفظ نسب المستثمرين',
        lockedCount: 'مقفل',
        openCount: 'مفتوح',
        lockAllForMonth: (month: string) => `قفل جميع الشقق لشهر ${month}`,
        lockAllTitle: 'تأكيد قفل جميع الشقق',
        lockAllConfirmMsg: (count: number, month: string) => `هل أنت متأكد من قفل ${count} شقة لشهر ${month}؟ لن تتمكن من تعديل بيانات هذا الشهر بعد القفل.`,
        lockAll: 'قفل الكل',
        snapshotNote: 'سيتم حفظ نسب المستثمرين الحالية كلقطة تاريخية لهذا الشهر',
        noApartments: 'لا توجد شقق',
        addApartmentsNote: 'أضف شقق من الإعدادات لتظهر هنا',

        // Table headers
        apartment: 'الشقة',
        status: 'الحالة',
        profit: 'الربح',
        lockDate: 'تاريخ القفل',
        action: 'إجراء',

        // Status
        locked: 'مقفل',
        open: 'مفتوح',

        // Actions
        unlock: 'فتح',
        lock: 'قفل',

        // Notes
        lockPreventsEditing: 'قفل الشهر يمنع إضافة أو تعديل أو حذف الحجوزات والمصروفات لذلك الشهر',
        snapshotSaved: 'عند القفل، يتم حفظ نسب المستثمرين الحالية كلقطة تاريخية',
        unlockAllowsEditing: 'فتح القفل يسمح بالتعديل لكن النسب التاريخية المحفوظة تبقى كسجل',
      },

      // ============================================
      // Audit Page
      // ============================================
      audit: {
        title: 'سجل المراجعة',
        subtitle: 'تتبع جميع العمليات المالية — مَن فعل ماذا ومتى',
        allEntities: 'جميع الكيانات',
        allOperations: 'جميع العمليات',
        searchPlaceholder: 'بحث بالاسم أو المعرف...',
        recordUnit: 'سجل',
        noRecords: 'لا توجد سجلات',
        noRecordsHint: 'ستظهر هنا جميع العمليات المالية بعد تنفيذها',
        loadingMore: 'جار تحميل المزيد...',
        allRecordsShown: 'تم عرض جميع السجلات',
        ipAddress: 'عنوان IP:',
        hideDetails: 'إخفاء ▲',
        showDetails: 'عرض ▼',
        today: 'اليوم',
        yesterday: 'أمس',
        dayBeforeYesterday: 'أول أمس',

        // Table headers
        time: 'الوقت',
        user: 'المستخدم',
        operation: 'العملية',
        entity: 'الكيان',
        identifier: 'المعرف',
        details: 'التفاصيل',

        // Update details headers
        field: 'الحقل',
        oldValue: 'القيمة السابقة',
        newValue: 'القيمة الجديدة',

        // Action labels
        actions: {
          CREATE: 'إنشاء',
          UPDATE: 'تعديل',
          DELETE: 'حذف',
          LOCK_MONTH: 'قفل شهر',
          UNLOCK_MONTH: 'فتح شهر',
          WITHDRAW: 'سحب',
          SYSTEM_RESET: 'تصفية النظام',
          RESTORE: 'استعادة',
        },

        // Entity labels
        entities: {
          BOOKING: 'حجز',
          EXPENSE: 'مصروف',
          INVESTOR: 'مستثمر',
          WITHDRAWAL: 'مسحوبات',
          MONTH: 'شهر',
          PROJECT: 'مشروع',
          APARTMENT: 'شقة',
          SETTINGS: 'إعدادات',
          SYSTEM: 'النظام',
        },

        // Entity filter options
        entityOptions: {
          all: 'جميع الكيانات',
          BOOKING: 'حجز',
          EXPENSE: 'مصروف',
          INVESTOR: 'مستثمر',
          WITHDRAWAL: 'مسحوبات',
          MONTH_LOCK: 'قفل شهر',
          SYSTEM: 'النظام',
        },

        // Action filter options
        actionOptions: {
          all: 'جميع العمليات',
          CREATE: 'إنشاء',
          UPDATE: 'تعديل',
          DELETE: 'حذف',
          LOCK_MONTH: 'قفل شهر',
          UNLOCK_MONTH: 'فتح شهر',
          WITHDRAW: 'سحب',
          SYSTEM_RESET: 'تصفية النظام',
          RESTORE: 'استعادة',
        },

        // Field labels (used in update details)
        fieldLabels: {
          amount: 'المبلغ',
          updatedAt: 'تاريخ التحديث',
          createdAt: 'تاريخ الإنشاء',
          description: 'الوصف',
          category: 'التصنيف',
          apartmentId: 'الشقة',
          month: 'الشهر',
          guestName: 'اسم الضيف',
          clientName: 'اسم العميل',
          clientPhone: 'هاتف العميل',
          checkIn: 'تاريخ الدخول',
          checkOut: 'تاريخ الخروج',
          platform: 'المنصة',
          totalAmount: 'المبلغ الإجمالي',
          netAmount: 'الصافي',
          nightRate: 'سعر الليلة',
          nightsCount: 'عدد الليالي',
          status: 'الحالة',
          percentage: 'النسبة',
          name: 'الاسم',
          email: 'البريد',
          phone: 'الهاتف',
          notes: 'ملاحظات',
          isLocked: 'مقفل',
          allApartments: 'جميع الشقق',
          success: 'نجح',
          failed: 'فشل',
          investorSnapshots: 'لقطات المستثمرين',
          profit: 'الربح',
          revenue: 'الإيرادات',
          expenses: 'المصروفات',
          type: 'النوع',
          date: 'التاريخ',
          comments: 'التعليقات',
          currency: 'العملة',
          balanceAfter: 'الرصيد بعد',
          balanceBefore: 'الرصيد قبل',
          deleted: 'محذوف',
          title: 'العنوان',
          source: 'المصدر',
          arrivalTime: 'وقت الوصول',
          flightNumber: 'رقم الرحلة',
          checkInSupervisor: 'مشرف الاستقبال',
          checkOutSupervisor: 'مشرف التسليم',
          commissionRate: 'نسبة العمولة',
          commission: 'العمولة',
          amountPaid: 'المبلغ المدفوع',
          amountRemaining: 'المتبقي',
          isPaid: 'مدفوع',
          paymentMethod: 'طريقة الدفع',
          isActive: 'نشط',
          investmentTarget: 'هدف الاستثمار',
          investorId: 'المستثمر',
          retainUsers: 'الاحتفاظ بالمستخدمين',
          wasDeleted: 'تم حذفه',
          previousCounts: 'الأعداد السابقة',
          bookings: 'الحجوزات',
          apartments: 'الشقق',
          projects: 'المشاريع',
          investors: 'المستثمرين',
          withdrawalsList: 'المسحوبات',
          auditLog: 'سجل المراجعة',
          exchangeRates: 'أسعار الصرف',
          systemSettings: 'إعدادات النظام',
          monthlySnapshots: 'اللقطات الشهرية',
          investorSnapshotsAlt: 'لقطات المستثمرين',
          apartmentInvestments: 'استثمارات الشقق',
          snapshots: 'اللقطات',
          settings: 'الإعدادات',
          currencies: 'العملات',
          backupVersion: 'إصدار النسخة',
          backupDate: 'تاريخ النسخة',
          restored: 'تم استعادته',
        },

        // Currency names
        currencyNames: {
          USD: 'دولار أمريكي',
          EUR: 'يورو',
          EGP: 'جنيه مصري',
          SAR: 'ريال سعودي',
          AED: 'درهم إماراتي',
          GBP: 'جنيه إسترليني',
        },
      },

      // ============================================
      // Settings Page
      // ============================================
      settings: {
        title: 'الإعدادات',
        subtitle: 'إدارة المشاريع، الشقق، سعر الصرف، المشرفين، والفريق',
        tabs: {
          projects: 'المشاريع',
          apartments: 'الشقق',
          exchangeRate: 'سعر الصرف',
          supervisors: 'المشرفين',
          team: 'الفريق',
          apartmentAssign: 'تعيين الشقق',
          system: 'النظام',
        },

        // Projects Manager
        projects: {
          title: 'المشاريع',
          projectName: 'اسم المشروع *',
          description: 'الوصف',
          noProjects: 'لا توجد مشاريع',
          apartmentUnit: 'شقة',
          editProject: 'تعديل المشروع',
          newProject: 'مشروع جديد',
          projectNameRequired: 'اسم المشروع مطلوب',
          deleteProject: 'حذف المشروع',
          confirmDeleteProject: (name: string) => `هل تريد حذف ${name}؟`,
          cannotDelete: (count: number) => `لا يمكن الحذف - يحتوي على ${count} شقة`,
        },

        // Apartments Manager
        apartments: {
          title: 'الشقق',
          noApartments: 'لا توجد شقق',
          floorLabel: 'طابق',
          disable: 'تعطيل',
          enable: 'تفعيل',
          editApartment: 'تعديل الشقة',
          newApartment: 'شقة جديدة',
          apartmentNameRequired: 'اسم الشقة *',
          projectRequired: 'المشروع *',
          selectProject: 'اختر المشروع',
          noProjects: 'لا يوجد مشاريع حتى الآن',
          floorNumber: 'الطابق',
          type: 'النوع',
          nameAndProjectRequired: 'الاسم والمشروع مطلوبان',
          disableApartment: 'تعطيل الشقة',
          enableApartment: 'تفعيل الشقة',
        },

        // Currency Rate Manager
        exchangeRate: {
          title: 'سعر الصرف',
          lastUpdate: 'آخر تحديث:',
        },

        // Supervisors Manager
        supervisors: {
          title: 'قائمة المشرفين',
          newSupervisorPlaceholder: 'اسم المشرف الجديد...',
          noSupervisors: 'لا يوجد مشرفين',
        },

        // Team Manager
        team: {
          title: 'أعضاء الفريق الحاليين',
          noMembers: 'لا يوجد أعضاء فريق',
          editMember: 'تعديل العضو',
          firstName: 'الاسم الأول',
          lastName: 'اسم العائلة',
          role: 'الدور',
          deleteMember: 'حذف العضو',
          confirmDeleteMember: (name: string) => `هل تريد حذف ${name}؟`,
          cannotUndo: 'هذا الإجراء لا يمكن التراجع عنه',
        },

        // Ops Apartment Assignments
        opsAssignments: {
          title: 'تعيين الشقق لمديري التشغيل',
          subtitle: 'اختر مدير التشغيل ثم حدد الشقق المسؤول عنها...',
          noOpsManagers: 'لا يوجد مديرو تشغيل في الفريق',
          selectOpsManager: 'اختر مدير التشغيل...',
          noManagers: 'لا يوجد مديرين حتى الآن',
          noAssignments: 'لم يتم تعيين أي شقق بعد',
          addApartment: 'إضافة شقة',
          allAssigned: 'كل الشقق معينة بالفعل',
        },

        // Invitation Manager  
        invitations: {
          title: 'دعوات الفريق',
          newInvitation: 'دعوة جديدة',
          noInvitations: 'لا توجد دعوات',
          createHint: 'أنشئ دعوة جديدة لإضافة عضو للفريق',
          copyLink: 'نسخ الرابط',
          showQR: 'عرض QR',
          used: 'مستخدمة',
          expired: 'منتهية',
          activeStatus: 'نشطة',
          day: 'يوم',
          hour: 'ساعة',
          selectRole: 'اختر الدور *',
          validityNote: 'صلاحية الدعوة ٣ أيام فقط',
          singleUseNote: 'الدعوة لاستخدام واحد فقط',
          expiresAfterRegister: 'تنتهي فوراً بعد التسجيل',
          creating: 'جاري الإنشاء...',
          createInvitation: 'إنشاء الدعوة',
          invitationCreated: 'تم إنشاء الدعوة',
          validFor: '٣ أيام',
          copied: 'تم النسخ!',
          copyInviteLink: 'نسخ رابط الدعوة',
          shareNote: 'شارك الرابط أو كود QR مع العضو الجديد',
          qrCode: 'كود QR',
          deleteInvitation: 'حذف الدعوة',
          confirmDeleteInvitation: (role: string) => `هل تريد حذف دعوة ${role}؟`,
          remaining: 'متبقي',
        },

        // System Manager
        system: {
          title: 'إدارة النظام',
          subtitle: 'إعادة تعيين النظام وإدارة النسخ الاحتياطية',
          resetSystem: 'إعادة تعيين النظام',
          resetDescription: 'حذف كل بيانات المحاسبة والبدء من جديد',
          resetWarning: 'سيتم حذف جميع بيانات المحاسبة (المشاريع، الشقق، الحجوزات، المصروفات، المستثمرين، المسحوبات، وسجل المراجعة). سيتم إنشاء نسخة احتياطية تلقائياً قبل التصفية.',
          resetting: 'جاري التصفية...',
          resetButton: 'إعادة تعيين النظام',
          backupHistory: 'سجل النسخ الاحتياطية',
          savedBackup: 'نسخة محفوظة',
          noBackups: 'لا توجد نسخ احتياطية',
          noBackupsSaved: 'لا توجد نسخ احتياطية محفوظة',
          
          // Backup dialog
          backupPromptTitle: 'نسخة احتياطية',
          backupPromptMessage: 'أنت على وشك تصفية النظام بالكامل. هل تريد إنشاء نسخة احتياطية أولاً؟',
          yesCreateBackup: 'نعم، أنشئ نسخة',
          noContinue: 'لا، تابع التصفية',
          backupNameTitle: 'تسمية النسخة الاحتياطية',
          backupNamePlaceholder: 'أدخل اسماً مميزاً...',
          backupNameExample: 'مثال: نسخة قبل بداية 2026',
          backupNameDesc: 'أدخل اسماً مميزاً للنسخة الاحتياطية حتى تتمكن من التعرف عليها لاحقاً.',
          saveAndContinue: 'حفظ ومتابعة',
          savingBackup: 'جاري الحفظ...',
          openBackupReadOnly: 'سيتم فتح النسخة في تبويب جديد للقراءة فقط — لن تتأثر البيانات الحالية.',
          statsLabel: (key: string) => {
            const map: Record<string, string> = {
              users: 'المستخدمين', projects: 'المشاريع', apartments: 'الشقق',
              bookings: 'الحجوزات', expenses: 'المصروفات', investors: 'المستثمرين',
              withdrawals: 'المسحوبات', snapshots: 'اللقطات', auditLogs: 'سجل المراجعة',
            };
            return map[key] || key;
          },
          
          // Confirm reset
          confirmResetTitle: 'تأكيد التصفية',
          confirmResetMessage: 'سيتم حذف جميع بيانات المحاسبة نهائياً',
          confirmResetIncludes: 'تشمل: المشاريع، الشقق، الحجوزات، المصروفات، المستثمرين، المسحوبات، وسجل المراجعة',
          yesReset: 'نعم، صفّ النظام',
          
          // Open backup
          openBackupTitle: 'فتح النسخة الاحتياطية',
          openBackupMessage: 'سيتم فتح النسخة في تبويب جديد للقراءة فقط. يمكنك مراجعة البيانات السابقة.',
          openInNewTab: 'فتح في تبويب جديد',
          
          // Delete backup
          deleteBackupTitle: 'حذف النسخة الاحتياطية',
          confirmDeleteBackup: (name: string) => `هل أنت متأكد من حذف "${name}"؟`,
          cannotUndo: 'لا يمكن التراجع عن هذا الإجراء',
          yesDelete: 'نعم، احذف',
        },
      },

      // ============================================
      // Backup Viewer Page
      // ============================================
      backup: {
        loading: 'جاري تحميل النسخة الاحتياطية...',
        error: 'خطأ',
        notFound: 'النسخة الاحتياطية غير موجودة',
        sections: {
          projects: 'المشاريع',
          apartments: 'الشقق',
          bookings: 'الحجوزات',
          expenses: 'المصروفات',
          investors: 'المستثمرين',
          withdrawals: 'المسحوبات',
          users: 'المستخدمين',
          auditLog: 'سجل المراجعة',
          snapshots: 'اللقطات',
        },

        // Table headers
        headers: {
          name: 'الاسم',
          description: 'الوصف',
          createdAt: 'تاريخ الإنشاء',
          floor: 'الطابق',
          type: 'النوع',
          status: 'الحالة',
          client: 'العميل',
          arrival: 'الوصول',
          departure: 'المغادرة',
          nights: 'الليالي',
          amount: 'المبلغ',
          currency: 'العملة',
          source: 'المصدر',
          category: 'الفئة',
          date: 'التاريخ',
          apartmentId: 'معرف الشقة',
          investorId: 'معرف المستثمر',
          percentage: 'النسبة',
          firstName: 'الاسم الأول',
          lastName: 'اسم العائلة',
          email: 'البريد',
          phone: 'الهاتف',
          role: 'الدور',
          user: 'المستخدم',
          action: 'الإجراء',
          entity: 'الكيان',
          notes: 'ملاحظات',
        },
      },
      // ============================================
      shared: {
        emptyState: {
          noData: 'لا توجد بيانات',
          noDataDesc: 'لم يتم إضافة أي سجلات بعد.',
          noResults: 'لا توجد نتائج',
          noResultsDesc: 'جرّب تغيير عوامل التصفية أو البحث بكلمات مختلفة.',
          error: 'حدث خطأ',
          errorDesc: 'لم نتمكن من تحميل البيانات. حاول مرة أخرى.',
          noFiles: 'لا توجد ملفات',
          noFilesDesc: 'لم يتم رفع أي ملفات بعد.',
        },
      },
    },
  },

  en: {
    accounting: {
      // ============================================
      // Common / Shared
      // ============================================
      common: {
        currency: 'EGP',
        currencySAR: 'SAR',
        currencyUSD: '$',
        loading: 'Loading...',
        saving: 'Saving...',
        deleting: 'Deleting...',
        saved: 'Saved',
        save: 'Save',
        saveChanges: 'Save Changes',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        close: 'Close',
        retry: 'Retry',
        refresh: 'Refresh',
        search: 'Search',
        back: 'Back',
        yes: 'Yes',
        no: 'No',
        openMenu: 'Open Menu',
        closeMenu: 'Close Menu',
        open: 'Open',
        noData: 'No data',
        active: 'Active',
        inactive: 'Inactive',
        disabled: 'Disabled',
        night: 'night',
        booking: 'booking',
        expense: 'expense',
        investor: 'investor',
        apartment: 'apartment',
        item: 'item',
        record: 'record',
        operation: 'operation',
        readOnly: 'Read-only',
        by: 'by',
        choose: 'Choose...',
        example: 'Example:',
        optional: 'optional',
        required: 'required',
        confirm: 'Confirm',
        confirmAction: 'Confirm Action',
        confirmActionMessage: 'Are you sure about this action? It cannot be undone.',
        confirmDelete: 'Confirm Delete',
        processing: 'Processing...',
        noProject: 'No project',
        floor: 'Floor',
        floorN: (n: number) => `Floor ${n}`,
        autoCalculated: 'Auto-calculated',
        showCharts: 'Show Charts',
        hideCharts: 'Hide Charts',
        showFilters: 'Show Filters',
        hideFilters: 'Hide Filters',
        activeFilters: 'Active Filters',
        showing100of: (n: number) => `Showing first 100 of ${n} items`,
        ofNApartments: (n: number) => `of ${n} apartments`,
      },

      errors: {
        generic: 'An error occurred',
        unexpected: 'An unexpected error occurred',
        fetchData: 'Error fetching data',
        saveFailed: 'Error while saving',
        deleteFailed: 'Error while deleting',
        connectionFailed: 'Connection to server failed',
        connectionError: 'Connection error',
        fetchApartments: 'Error fetching apartments',
        fetchProjects: 'Error fetching projects',
        createApartment: 'Error creating apartment',
        editApartment: 'Error editing apartment',
        fetchBookings: 'Error fetching bookings',
        fetchExpenses: 'Error fetching expenses',
        fetchInvestorData: 'Failed to fetch data',
        fetchApartmentData: 'Error fetching apartment data',
        fetchCustody: 'Error fetching data',
        fetchMonthStatus: 'Failed to load month status',
        fetchAuditLogs: 'Failed to load audit logs',
        fetchBackup: 'Failed to fetch backup',
        fetchFailed: 'Failed to fetch data',
        saveFetchFailed: 'Failed to save',
        deleteFetchFailed: 'Failed to delete',
        assignError: 'Error assigning investor',
        withdrawalError: 'Error recording withdrawal',
        deleteError: 'Error deleting',
        backupCreateFailed: 'Failed to create backup',
        resetFailed: 'Operation failed',
        loadInvestmentData: 'Error loading investment data',
        allFieldsRequired: 'All fields are required',
        percentRange: 'Percentage must be between 1% and 100%',
        selectApartmentAndInvestor: 'Please select apartment, investor, and specify percentage',
        amountMustBePositive: 'Amount must be greater than zero',
        selectApartmentAmountDate: 'Please select apartment, amount, and date',
        exchangeRateMustBePositive: 'Exchange rate must be a positive number',
        supervisorExists: 'This supervisor already exists',
        minOneSupervisor: 'At least one supervisor is required',
      },

      success: {
        bookingUpdated: 'Booking updated successfully',
        bookingAdded: 'Booking added successfully',
        bookingDeleted: 'Booking deleted successfully',
        expenseUpdated: 'Expense updated successfully',
        expenseAdded: 'Expense added successfully',
        expenseDeleted: 'Expense deleted successfully',
        locked: 'Locked successfully',
        unlocked: 'Unlocked successfully',
        systemReset: 'System has been fully reset',
        deleted: (name: string) => `"${name}" deleted`,
      },

      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ] as readonly string[],

      monthSelector: {
        prevMonth: 'Previous Month',
        nextMonth: 'Next Month',
      },

      bookingSources: {
        EXTERNAL: 'External',
        DIRECT: 'Direct',
        OTHER: 'Other',
      },

      bookingSourceFilters: {
        all: 'All Sources',
        EXTERNAL: 'External',
        DIRECT: 'Direct',
        OTHER: 'Other',
      },

      bookingStatuses: {
        CONFIRMED: 'Confirmed',
        PENDING: 'Pending',
        COMPLETED: 'Completed',
        CHECKED_IN: 'Checked In',
        CHECKED_OUT: 'Checked Out',
        CANCELLED: 'Cancelled',
      },

      bookingStatusFilters: {
        all: 'All Statuses',
        CONFIRMED: 'Confirmed',
        CHECKED_IN: 'Checked In',
        CHECKED_OUT: 'Checked Out',
        CANCELLED: 'Cancelled',
      },

      expenseCategories: {
        CLEANING: 'Apartment Cleaning',
        INTERNET: 'Internet',
        WATER: 'Water',
        GAS: 'Gas',
        ELECTRICITY: 'Electricity',
        MAINTENANCE: 'Maintenance',
        SUPPLIES: 'Supplies',
        FURNITURE: 'Furniture',
        LAUNDRY: 'Bed Sheets Laundry',
        TOWELS: 'Bathroom Towels',
        KITCHEN_SUPPLIES: 'Kitchen Supplies',
        AIR_CONDITIONING: 'Air Conditioning',
        OTHER: 'Other',
      },

      expenseCategoriesShort: {
        CLEANING: 'Cleaning',
        MAINTENANCE: 'Maintenance',
        ELECTRICITY: 'Electricity',
        WATER: 'Water',
        GAS: 'Gas',
        INTERNET: 'Internet',
        FURNITURE: 'Furniture',
        SUPPLIES: 'Supplies',
        LAUNDRY: 'Laundry',
        TOWELS: 'Towels',
        KITCHEN_SUPPLIES: 'Kitchen',
        AIR_CONDITIONING: 'A/C',
        OTHER: 'Other',
      },

      roles: {
        ADMIN: 'Site Admin & General Manager',
        GENERAL_MANAGER: 'General Manager',
        OPS_MANAGER: 'Operations Manager',
        BOOKING_MANAGER: 'Booking Manager',
        INVESTOR: 'Investor',
      },

      sidebar: {
        dashboard: 'Dashboard',
        apartments: 'Apartments',
        bookings: 'Bookings',
        expenses: 'Expenses',
        custody: 'Custody',
        daily: 'Daily Schedule',
        investors: 'Investors',
        myInvestments: 'My Account',
        reports: 'Reports',
        monthLock: 'Month Lock',
        audit: 'Audit Log',
        settings: 'Settings',
        backToMain: 'Back to Main Page',
        logout: 'Logout',
      },

      dashboard: {
        title: 'Dashboard',
        subtitle: 'Accounts Overview',
        totalRevenue: 'Total Revenue',
        totalExpenses: 'Total Expenses',
        netProfit: 'Net Profit',
        bookingsCount: 'Bookings Count',
        apartmentsCount: 'Apartments Count',
        occupancyRate: 'Occupancy Rate',
        pendingApproval: 'Pending Approval',
        revenueExpenses12Months: 'Revenue & Expenses (Last 12 Months)',
        expensesByCategory: 'Expenses by Category',
        bookingSources: 'Booking Sources',

        revenue: 'Revenue',
        expensesLabel: 'Expenses',
        profit: 'Profit',
        noDataToShow: 'No data to display',

        recentBookings: 'Recent Bookings',
        recentExpenses: 'Recent Expenses',
        noBookingsYet: 'No bookings yet',
        noExpensesYet: 'No expenses yet',
        noBookingsThisMonth: 'No bookings this month',
        noExpensesThisMonth: 'No expenses this month',

        todayAlerts: 'Today\'s Alerts',
        event: 'event',
        noEventsToday: 'No events today',
        checkIn: 'Check-in',
        checkOut: 'Check-out',

        amount: 'Amount:',
        bookingsLabel: 'Bookings:',

        statusConfirmed: 'Confirmed',
        statusPending: 'Pending',
        statusCancelled: 'Cancelled',
        statusCompleted: 'Completed',
      },

      apartments: {
        title: 'Apartments',
        subtitle: 'Manage Apartments & Projects',
        addApartment: 'Add Apartment',
        searchPlaceholder: 'Search by name...',
        allProjects: 'All Projects',
        noApartmentsFilter: 'No apartments match the filter',
        noApartments: 'No apartments yet',
        addFirstApartment: 'Add First Apartment',
        apartmentUnit: 'apartment',
        apartmentNotFound: 'Apartment not found',
        backToApartments: 'Back to Apartments',

        totalRevenue: 'Total Revenue',
        totalExpenses: 'Total Expenses',
        netProfit: 'Net Profit',
        bookingsCount: 'Bookings Count',
        nightsBooked: 'Nights Booked',

        bookingsRevenue: 'Bookings (Revenue)',
        noBookingsThisMonth: 'No bookings this month',
        
        expensesTitle: 'Expenses',
        noExpensesThisMonth: 'No expenses this month',
        
        investorsTable: 'Investors Table',
        totalPercentages: 'Total Percentages:',
        noInvestors: 'No investors for this apartment',

        client: 'Client',
        checkInDate: 'Check-in',
        checkOutDate: 'Check-out',
        nights: 'Nights',
        amountHeader: 'Amount',
        source: 'Source',
        status: 'Status',
        description: 'Description',
        category: 'Category',
        date: 'Date',
        name: 'Name',
        percentage: 'Percentage',
        profitHeader: 'Profit',
        withdrawals: 'Withdrawals',
        remaining: 'Remaining',
      },

      apartmentForm: {
        editTitle: 'Edit Apartment',
        addTitle: 'Add New Apartment',
        project: 'Project',
        selectProject: 'Select Project',
        noProjects: 'No projects yet',
        apartmentName: 'Apartment Name',
        namePlaceholder: 'e.g. Al-Manyal - 5th Floor',
        floorNumber: 'Floor Number',
        floorPlaceholder: 'e.g. 5',
        apartmentType: 'Apartment Type',
        typePlaceholder: 'e.g. Panorama',
        saveEdit: 'Save Changes',
        addApartment: 'Add Apartment',
        nameRequired: 'Apartment name is required',
        projectRequired: 'Project selection is required',
      },

      bookings: {
        title: 'Bookings',
        subtitle: 'Manage Bookings & Occupancy',
        altSubtitle: 'Revenue & Bookings Sheet',
        addBooking: 'Add Booking',
        searchPlaceholder: 'Search by name or phone...',
        allApartments: 'All Apartments',
        deleteBooking: 'Delete Booking?',
        deleteConfirm: (name: string) => `Booking "${name}" will be permanently deleted. This action cannot be undone.`,

        totalRevenue: 'Total Revenue',
        bookingsCount: 'Bookings Count',
        nightsBooked: 'Nights Booked',
        avgNightRate: 'Average Night Rate',
        activeApartments: 'Active Apartments',

        bookingsList: 'Bookings List',
        noBookingsFilter: 'No bookings match the filter',

        apartment: 'Apartment',
        client: 'Client',
        checkIn: 'Check-in',
        checkOut: 'Check-out',
        nights: 'Nights',
        amount: 'Amount',
        source: 'Source',
        status: 'Status',
        actions: 'Actions',

        sourceDistribution: 'Bookings Distribution by Source',
        apartmentRevenueComparison: 'Apartment Revenue Comparison',
      },

      bookingForm: {
        editTitle: 'Edit Booking',
        addTitle: 'Add New Booking',
        apartment: 'Apartment',
        selectApartment: 'Select Apartment',
        noApartments: 'No apartments yet',
        clientName: 'Client Name',
        guestName: 'Guest Name',
        contactNumber: 'Contact Number',
        bookingSource: 'Booking Source',
        checkInDate: 'Check-in Date',
        checkOutDate: 'Check-out Date',
        nightsCount: 'Number of Nights',
        financialValue: 'Financial Value',
        arrivalTime: 'Arrival Time',
        status: 'Status',
        notes: 'Notes',
        notesPlaceholder: 'Additional notes...',
        saveEdit: 'Save Changes',
        saveBooking: 'Save Booking',

        apartmentRequired: 'Apartment is required',
        clientNameRequired: 'Client name is required',
        checkInRequired: 'Check-in date is required',
        checkOutRequired: 'Check-out date is required',
        checkOutAfterCheckIn: 'Check-out must be after check-in',
        amountMustBePositive: 'Amount must be greater than 0',
      },

      expenses: {
        title: 'Expenses',
        subtitle: 'Expenses Sheet by Apartment',
        addExpense: 'Add Expense',
        searchPlaceholder: 'Search by description or notes...',
        allApartments: 'All Apartments',
        allCategories: 'All Categories',
        deleteExpense: 'Delete Expense?',
        deleteConfirm: (name: string) => `"${name}" will be permanently deleted. This action cannot be undone.`,

        totalExpenses: 'Total Expenses',
        expenseCount: 'Expense Count',
        avgExpense: 'Average Expense',
        apartmentsWithExpenses: 'Apartments with Expenses',
        topCategory: 'Top Category',

        expensesList: 'Expenses List',
        noExpensesFilter: 'No expenses match the filter',

        categoryDistribution: 'Expenses by Category',
        apartmentComparison: 'Apartment Expenses Comparison',

        apartment: 'Apartment',
        description: 'Description',
        category: 'Category',
        date: 'Date',
        amount: 'Amount',
        actions: 'Actions',

        amountLabel: 'Amount:',
        countLabel: 'Count:',

        // Approval
        allStatuses: 'All Statuses',
        statusPENDING: 'Pending Approval',
        statusAPPROVED: 'Approved',
        statusREJECTED: 'Rejected',
        approve: 'Approve',
        reject: 'Reject',
        rejectionReasonTitle: 'Rejection Reason',
        rejectionReasonPlaceholder: 'Enter reason for rejecting the expense...',
        rejectionReasonRequired: 'Rejection reason is required',
        approveConfirm: 'Confirm Approval',
        approveConfirmMsg: 'Do you want to approve this expense?',
        approvedSuccess: 'Expense approved',
        rejectedSuccess: 'Expense rejected',
        status: 'Status',
      },

      expenseForm: {
        editTitle: 'Edit Expense',
        addTitle: 'Add New Expense',
        apartment: 'Apartment',
        selectApartment: 'Select Apartment',
        noApartments: 'No apartments yet',
        description: 'Description',
        descriptionPlaceholder: 'e.g. Apartment cleaning after guest checkout',
        category: 'Category',
        amount: 'Amount',
        date: 'Date',
        notes: 'Notes',
        notesPlaceholder: 'Additional notes...',
        saveEdit: 'Save Changes',
        saveExpense: 'Save Expense',

        apartmentRequired: 'Apartment is required',
        descriptionRequired: 'Description is required',
        categoryRequired: 'Category is required',
        amountMustBePositive: 'Amount must be greater than 0',
        dateRequired: 'Date is required',
      },

      custody: {
        title: 'Custody',
        subtitleAdmin: 'Manage Operations Managers\' Custodies',
        subtitleUser: 'Custodies Assigned to You',
        newCustody: 'New Custody',
        totalCustody: 'Total Custodies',
        spent: 'Spent',
        remaining: 'Remaining',
        noCustody: 'No custodies recorded',
        locked: 'Locked',
        unlocked: 'Open',
        custodyLabel: 'Custody',

        newCustodyTitle: 'New Custody',
        opsManager: 'Operations Manager *',
        noManagers: 'No managers yet',
        apartmentLabel: 'Apartment *',
        noApartments: 'No apartments yet',
        amountLabel: (currency: string) => `Amount (${currency}) *`,
        monthLabel: 'Month *',
        notesLabel: 'Notes',
        createCustody: 'Create Custody',
      },

      daily: {
        title: 'Daily Schedule',
        subtitle: 'Track apartment check-ins and check-outs',
        today: 'Today',
        tomorrow: 'Tomorrow',
        tomorrowAutoNote: 'Tomorrow\'s schedule shown automatically (after 7 PM)',
        autoUpdateNote: 'Updates at 7:00 PM',
        backToAutoDate: 'Back to Auto Date',
        checkInsTitle: 'Check-in Bookings',
        checkOutsTitle: 'Check-out Bookings',
        noActivity: 'No check-in or check-out activity on this day',

        loadingCheckIn: 'Loading check-in data...',
        loadingCheckOut: 'Loading check-out data...',
        checkInTitle: 'Check-in',
        checkOutTitle: 'Check-out',
        noCheckIns: 'No check-in bookings for this day',
        noCheckOuts: 'No check-out bookings for this day',

        apartment: 'Apartment',
        guest: 'Guest',
        contact: 'Contact',
        arrival: 'Arrival',
        departure: 'Departure',
        nights: 'Nights',
        receptionSupervisor: 'Reception Supervisor',
        deliverySupervisor: 'Delivery Supervisor',

        selectSupervisor: 'Select Supervisor',
        customName: 'Custom name...',
      },

      investors: {
        title: 'Investor Management',
        subtitle: 'Investors, percentages, and withdrawals',
        assignInvestor: 'Assign Investor to Apartment',
        searchPlaceholder: 'Search by name or email...',
        investorUnit: 'investor',
        investmentUnit: 'investment',
        
        editPercentage: 'Edit Percentage',
        percentageLabel: 'Percentage (%)',
        yearlyTarget: 'Yearly Target',
        saveEdit: 'Save Changes',

        confirmRemove: 'Confirm Removal',
        confirmRemoveMessage: (name: string, apartment: string) => `Remove ${name} from apartment ${apartment}? This action cannot be undone.`,
        yesRemove: 'Yes, Remove',

        loadingInvestors: 'Loading investors...',
        noInvestors: 'No investors registered',
        addInvestorHint: 'Add a new investor using the "Assign Investor" button',
        apartmentUnit: 'apartment',
        registerWithdrawal: 'Record Profit Withdrawal',
        viewFinancialDetails: 'View Financial Details',
        noLinkedInvestments: 'No linked investments',
        editPercentageAction: 'Edit Percentage',
        removeFromApartment: 'Remove from Apartment',
        yearlyTargetHeader: 'Yearly Target',
        withdrawalsHeader: 'Withdrawals',
        actionsHeader: 'Actions',
      },

      investorDetail: {
        financialDetails: 'Financial Details',
        loadingData: 'Loading investor data...',
        investmentsCount: 'Investment Count',
        noInvestments: 'No linked investments',
        investments: (n: number) => `Investments (${n})`,
      },

      assignInvestorModal: {
        title: 'Assign Investor to Apartment',
        apartment: 'Apartment',
        selectApartment: 'Select apartment...',
        noApartments: 'No apartments yet',
        investor: 'Investor',
        loadingInvestors: 'Loading investors...',
        selectInvestor: 'Select investor...',
        noInvestors: 'No investors yet',
        percentage: 'Percentage (%)',
        percentagePlaceholder: 'e.g. 20',
        yearlyTarget: 'Yearly Target (optional)',
        yearlyTargetPlaceholder: 'e.g. 3000',
        assign: 'Assign Investor',
      },

      withdrawalForm: {
        title: 'Record Profit Withdrawal',
        apartmentInvestment: 'Apartment (Investment)',
        selectApartment: 'Select apartment...',
        noInvestments: 'No investments yet',
        percentage: 'percentage',
        amount: 'Amount',
        currency: 'Currency',
        withdrawalDate: 'Withdrawal Date',
        notes: 'Notes (optional)',
        notesPlaceholder: 'Withdrawal description...',
        submit: 'Record Profit Withdrawal',
      },

      investorPortal: {
        myPercentage: 'My Share:',
        balance: 'Balance:',
        financialSummary: 'Financial Summary',
        totalRevenue: 'Total Revenue',
        totalExpenses: 'Total Expenses',
        netProfit: 'Net Profit',
        myPercentageInApartment: 'My Share in this Apartment',
        yearlyProgress: 'Yearly Progress',
        achieved: 'Achieved:',
        target: 'Target:',

        finalBalance: 'Final Balance',
        accountSummary: 'Total Account Summary',
        totalProfits: 'Total Profits',
        totalWithdrawals: 'Total Withdrawals',
        remainingBalance: 'Remaining Balance',
        advanceBalance: 'Advance (Debit Balance)',

        monthlyProfit: 'Monthly Profit',
        noDataThisYear: 'No data for this year',
        month: 'Month',
        revenue: 'Revenue',
        expenses: 'Expenses',
        profit: 'Profit',
        myShare: 'My Share',
        total: 'Total',

        withdrawalsTitle: 'Withdrawals',
        loadingWithdrawals: 'Loading withdrawals...',
        operationUnit: 'operation',
        noWithdrawals: 'No withdrawals',
        withdrawalAmount: 'Amount',
        withdrawalDate: 'Date',
        withdrawalApartment: 'Apartment',
        withdrawalNotes: 'Notes',
        totalWithdrawalsLabel: 'Total Withdrawals',
      },

      myInvestments: {
        title: 'My Account',
        subtitle: 'Your investments, profits, and withdrawals',
        loadingData: 'Loading investment data...',
        investmentsIn: (n: number) => `You have investments in ${n} apartments`,
        noInvestments: 'No investments currently registered',
        contactAdmin: 'Contact the general manager to link your account to an apartment',
      },

      reports: {
        title: 'Reports & Summaries',
        monthlySubtitle: 'Detailed Monthly Summary',
        yearlySubtitle: 'Comprehensive Yearly Summary',
        monthly: 'Monthly',
        yearly: 'Yearly',

        apartmentComparison: 'Apartment Comparison',
        occupancyPerApartment: 'Occupancy per Apartment',
        expensesByCategory: 'Expenses by Category',
        bookingSources: 'Booking Sources',
        profitTrend: (year: number) => `Profit Trend - ${year}`,
        yearlyApartmentComparison: 'Apartment Comparison (Yearly)',
        totalOccupancy: 'Total Occupancy per Apartment',

        busyNights: 'Busy Nights:',
        occupancyRate: 'Occupancy Rate:',
        occupancyCount: 'Bookings Count:',
        noOccupancyData: 'No occupancy data',
        busyNightsLegend: 'Busy Nights',

        noTrendData: 'Not enough data to show trend',

        noComparisonData: 'No comparison data',

        aggregateSummary: 'Aggregate Summary',
        allApartmentsTotal: 'All Apartments Total',
        apartments: 'Apartments',
        noDataToShow: 'No data to display',
        margin: 'margin',

        downloadingPDF: 'Downloading...',
        downloadPDF: 'Download PDF',
      },

      monthLock: {
        title: 'Month Lock',
        subtitle: 'Lock financial months to prevent editing and save investor percentages',
        lockedCount: 'Locked',
        openCount: 'Open',
        lockAllForMonth: (month: string) => `Lock all apartments for ${month}`,
        lockAllTitle: 'Confirm Lock All',
        lockAllConfirmMsg: (count: number, month: string) => `Are you sure you want to lock ${count} apartments for ${month}? You won't be able to edit data for this month after locking.`,
        lockAll: 'Lock All',
        snapshotNote: 'Current investor percentages will be saved as a historical snapshot for this month',
        noApartments: 'No apartments',
        addApartmentsNote: 'Add apartments from settings to show here',

        apartment: 'Apartment',
        status: 'Status',
        profit: 'Profit',
        lockDate: 'Lock Date',
        action: 'Action',

        locked: 'Locked',
        open: 'Open',

        unlock: 'Unlock',
        lock: 'Lock',

        lockPreventsEditing: 'Locking a month prevents adding, editing, or deleting bookings and expenses for that month',
        snapshotSaved: 'When locked, current investor percentages are saved as a historical snapshot',
        unlockAllowsEditing: 'Unlocking allows editing but saved historical percentages remain as records',
      },

      audit: {
        title: 'Audit Log',
        subtitle: 'Track all financial operations — who did what and when',
        allEntities: 'All Entities',
        allOperations: 'All Operations',
        searchPlaceholder: 'Search by name or ID...',
        recordUnit: 'record',
        noRecords: 'No records',
        noRecordsHint: 'All financial operations will appear here after execution',
        loadingMore: 'Loading more...',
        allRecordsShown: 'All records shown',
        ipAddress: 'IP Address:',
        hideDetails: 'Hide ▲',
        showDetails: 'Show ▼',
        today: 'Today',
        yesterday: 'Yesterday',
        dayBeforeYesterday: 'Day before yesterday',

        time: 'Time',
        user: 'User',
        operation: 'Operation',
        entity: 'Entity',
        identifier: 'ID',
        details: 'Details',

        field: 'Field',
        oldValue: 'Old Value',
        newValue: 'New Value',

        actions: {
          CREATE: 'Create',
          UPDATE: 'Update',
          DELETE: 'Delete',
          LOCK_MONTH: 'Lock Month',
          UNLOCK_MONTH: 'Unlock Month',
          WITHDRAW: 'Withdraw',
          SYSTEM_RESET: 'System Reset',
          RESTORE: 'Restore',
        },

        entities: {
          BOOKING: 'Booking',
          EXPENSE: 'Expense',
          INVESTOR: 'Investor',
          WITHDRAWAL: 'Withdrawal',
          MONTH: 'Month',
          PROJECT: 'Project',
          APARTMENT: 'Apartment',
          SETTINGS: 'Settings',
          SYSTEM: 'System',
        },

        entityOptions: {
          all: 'All Entities',
          BOOKING: 'Booking',
          EXPENSE: 'Expense',
          INVESTOR: 'Investor',
          WITHDRAWAL: 'Withdrawal',
          MONTH_LOCK: 'Month Lock',
          SYSTEM: 'System',
        },

        actionOptions: {
          all: 'All Operations',
          CREATE: 'Create',
          UPDATE: 'Update',
          DELETE: 'Delete',
          LOCK_MONTH: 'Lock Month',
          UNLOCK_MONTH: 'Unlock Month',
          WITHDRAW: 'Withdraw',
          SYSTEM_RESET: 'System Reset',
          RESTORE: 'Restore',
        },

        fieldLabels: {
          amount: 'Amount',
          updatedAt: 'Updated At',
          createdAt: 'Created At',
          description: 'Description',
          category: 'Category',
          apartmentId: 'Apartment',
          month: 'Month',
          guestName: 'Guest Name',
          clientName: 'Client Name',
          clientPhone: 'Client Phone',
          checkIn: 'Check-in Date',
          checkOut: 'Check-out Date',
          platform: 'Platform',
          totalAmount: 'Total Amount',
          netAmount: 'Net Amount',
          nightRate: 'Night Rate',
          nightsCount: 'Number of Nights',
          status: 'Status',
          percentage: 'Percentage',
          name: 'Name',
          email: 'Email',
          phone: 'Phone',
          notes: 'Notes',
          isLocked: 'Locked',
          allApartments: 'All Apartments',
          success: 'Succeeded',
          failed: 'Failed',
          investorSnapshots: 'Investor Snapshots',
          profit: 'Profit',
          revenue: 'Revenue',
          expenses: 'Expenses',
          type: 'Type',
          date: 'Date',
          comments: 'Comments',
          currency: 'Currency',
          balanceAfter: 'Balance After',
          balanceBefore: 'Balance Before',
          deleted: 'Deleted',
          title: 'Title',
          source: 'Source',
          arrivalTime: 'Arrival Time',
          flightNumber: 'Flight Number',
          checkInSupervisor: 'Reception Supervisor',
          checkOutSupervisor: 'Delivery Supervisor',
          commissionRate: 'Commission Rate',
          commission: 'Commission',
          amountPaid: 'Amount Paid',
          amountRemaining: 'Remaining',
          isPaid: 'Paid',
          paymentMethod: 'Payment Method',
          isActive: 'Active',
          investmentTarget: 'Investment Target',
          investorId: 'Investor',
          retainUsers: 'Retain Users',
          wasDeleted: 'Was Deleted',
          previousCounts: 'Previous Counts',
          bookings: 'Bookings',
          apartments: 'Apartments',
          projects: 'Projects',
          investors: 'Investors',
          withdrawalsList: 'Withdrawals',
          auditLog: 'Audit Log',
          exchangeRates: 'Exchange Rates',
          systemSettings: 'System Settings',
          monthlySnapshots: 'Monthly Snapshots',
          investorSnapshotsAlt: 'Investor Snapshots',
          apartmentInvestments: 'Apartment Investments',
          snapshots: 'Snapshots',
          settings: 'Settings',
          currencies: 'Currencies',
          backupVersion: 'Backup Version',
          backupDate: 'Backup Date',
          restored: 'Restored',
        },

        currencyNames: {
          USD: 'US Dollar',
          EUR: 'Euro',
          EGP: 'Egyptian Pound',
          SAR: 'Saudi Riyal',
          AED: 'UAE Dirham',
          GBP: 'British Pound',
        },
      },

      settings: {
        title: 'Settings',
        subtitle: 'Manage projects, apartments, exchange rate, supervisors, and team',
        tabs: {
          projects: 'Projects',
          apartments: 'Apartments',
          exchangeRate: 'Exchange Rate',
          supervisors: 'Supervisors',
          team: 'Team',
          apartmentAssign: 'Apartment Assignments',
          system: 'System',
        },

        projects: {
          title: 'Projects',
          projectName: 'Project Name *',
          description: 'Description',
          noProjects: 'No projects',
          apartmentUnit: 'apartment',
          editProject: 'Edit Project',
          newProject: 'New Project',
          projectNameRequired: 'Project name is required',
          deleteProject: 'Delete Project',
          confirmDeleteProject: (name: string) => `Delete ${name}?`,
          cannotDelete: (count: number) => `Cannot delete - contains ${count} apartments`,
        },

        apartments: {
          title: 'Apartments',
          noApartments: 'No apartments',
          floorLabel: 'floor',
          disable: 'Disable',
          enable: 'Enable',
          editApartment: 'Edit Apartment',
          newApartment: 'New Apartment',
          apartmentNameRequired: 'Apartment Name *',
          projectRequired: 'Project *',
          selectProject: 'Select Project',
          noProjects: 'No projects yet',
          floorNumber: 'Floor',
          type: 'Type',
          nameAndProjectRequired: 'Name and project are required',
          disableApartment: 'Disable Apartment',
          enableApartment: 'Enable Apartment',
        },

        exchangeRate: {
          title: 'Exchange Rate',
          lastUpdate: 'Last update:',
        },

        supervisors: {
          title: 'Supervisors List',
          newSupervisorPlaceholder: 'New supervisor name...',
          noSupervisors: 'No supervisors',
        },

        team: {
          title: 'Current Team Members',
          noMembers: 'No team members',
          editMember: 'Edit Member',
          firstName: 'First Name',
          lastName: 'Last Name',
          role: 'Role',
          deleteMember: 'Delete Member',
          confirmDeleteMember: (name: string) => `Delete ${name}?`,
          cannotUndo: 'This action cannot be undone',
        },

        opsAssignments: {
          title: 'Assign Apartments to Operations Managers',
          subtitle: 'Select an operations manager then assign apartments...',
          noOpsManagers: 'No operations managers in the team',
          selectOpsManager: 'Select operations manager...',
          noManagers: 'No managers yet',
          noAssignments: 'No apartments assigned yet',
          addApartment: 'Add Apartment',
          allAssigned: 'All apartments are already assigned',
        },

        invitations: {
          title: 'Team Invitations',
          newInvitation: 'New Invitation',
          noInvitations: 'No invitations',
          createHint: 'Create a new invitation to add a team member',
          copyLink: 'Copy Link',
          showQR: 'Show QR',
          used: 'Used',
          expired: 'Expired',
          activeStatus: 'Active',
          day: 'day',
          hour: 'hour',
          selectRole: 'Select Role *',
          validityNote: 'Invitation valid for 3 days only',
          singleUseNote: 'Single use invitation only',
          expiresAfterRegister: 'Expires immediately after registration',
          creating: 'Creating...',
          createInvitation: 'Create Invitation',
          invitationCreated: 'Invitation Created',
          validFor: '3 days',
          copied: 'Copied!',
          copyInviteLink: 'Copy Invitation Link',
          shareNote: 'Share the link or QR code with the new member',
          qrCode: 'QR Code',
          deleteInvitation: 'Delete Invitation',
          confirmDeleteInvitation: (role: string) => `Delete ${role} invitation?`,
          remaining: 'Remaining',
        },

        system: {
          title: 'System Management',
          subtitle: 'Reset system and manage backups',
          resetSystem: 'Reset System',
          resetDescription: 'Delete all accounting data and start fresh',
          resetWarning: 'All accounting data will be deleted (projects, apartments, bookings, expenses, investors, withdrawals, and audit log). A backup will be automatically created before reset.',
          resetting: 'Resetting...',
          resetButton: 'Reset System',
          backupHistory: 'Backup History',
          savedBackup: 'saved backup',
          noBackups: 'No backups',
          noBackupsSaved: 'No backups saved',
          
          backupPromptTitle: 'Backup',
          backupPromptMessage: 'You are about to fully reset the system. Create a backup first?',
          yesCreateBackup: 'Yes, Create Backup',
          noContinue: 'No, Continue Reset',
          backupNameTitle: 'Backup Name',
          backupNamePlaceholder: 'Enter a unique name...',
          backupNameExample: 'e.g. Backup before 2026',
          backupNameDesc: 'Enter a unique name for the backup so you can identify it later.',
          saveAndContinue: 'Save & Continue',
          savingBackup: 'Saving...',
          openBackupReadOnly: 'The backup will open in a new read-only tab — current data will not be affected.',
          statsLabel: (key: string) => {
            const map: Record<string, string> = {
              users: 'Users', projects: 'Projects', apartments: 'Apartments',
              bookings: 'Bookings', expenses: 'Expenses', investors: 'Investors',
              withdrawals: 'Withdrawals', snapshots: 'Snapshots', auditLogs: 'Audit Log',
            };
            return map[key] || key;
          },
          
          confirmResetTitle: 'Confirm Reset',
          confirmResetMessage: 'All accounting data will be permanently deleted',
          confirmResetIncludes: 'Includes: projects, apartments, bookings, expenses, investors, withdrawals, and audit log',
          yesReset: 'Yes, Reset System',
          
          openBackupTitle: 'Open Backup',
          openBackupMessage: 'The backup will open in a new read-only tab. You can review previous data.',
          openInNewTab: 'Open in New Tab',
          
          deleteBackupTitle: 'Delete Backup',
          confirmDeleteBackup: (name: string) => `Are you sure you want to delete "${name}"?`,
          cannotUndo: 'This action cannot be undone',
          yesDelete: 'Yes, Delete',
        },
      },

      backup: {
        loading: 'Loading backup...',
        error: 'Error',
        notFound: 'Backup not found',
        sections: {
          projects: 'Projects',
          apartments: 'Apartments',
          bookings: 'Bookings',
          expenses: 'Expenses',
          investors: 'Investors',
          withdrawals: 'Withdrawals',
          users: 'Users',
          auditLog: 'Audit Log',
          snapshots: 'Snapshots',
        },

        headers: {
          name: 'Name',
          description: 'Description',
          createdAt: 'Created At',
          floor: 'Floor',
          type: 'Type',
          status: 'Status',
          client: 'Client',
          arrival: 'Arrival',
          departure: 'Departure',
          nights: 'Nights',
          amount: 'Amount',
          currency: 'Currency',
          source: 'Source',
          category: 'Category',
          date: 'Date',
          apartmentId: 'Apartment ID',
          investorId: 'Investor ID',
          percentage: 'Percentage',
          firstName: 'First Name',
          lastName: 'Last Name',
          email: 'Email',
          phone: 'Phone',
          role: 'Role',
          user: 'User',
          action: 'Action',
          entity: 'Entity',
          notes: 'Notes',
        },
      },
      // ============================================
      shared: {
        emptyState: {
          noData: 'No data',
          noDataDesc: 'No records have been added yet.',
          noResults: 'No results',
          noResultsDesc: 'Try changing the filters or searching with different terms.',
          error: 'An error occurred',
          errorDesc: 'Could not load data. Please try again.',
          noFiles: 'No files',
          noFilesDesc: 'No files have been uploaded yet.',
        },
      },
    },
  },
};

export default accountingTranslations;
