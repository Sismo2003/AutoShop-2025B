import db from '../config/db.js';

class dashboardModel {
  static async scheduleCount() {
    const [jobs] = await db.query(`SELECT COUNT(*) as schedule_jobs FROM appointments WHERE status = 'scheduled'`);
    return jobs[0].schedule_jobs;
  }

  static async MonthCompletedCount() {
    const [jobs] = await db.query(`
      SELECT
        COUNT(*) AS completed_jobs
      FROM appointments
      WHERE status = 'completed'
        AND YEAR(installation_date) = YEAR(CURDATE())
        AND MONTH(installation_date) = MONTH(CURDATE());
    `);
    return jobs[0].completed_jobs;
  }

  static async customerCount() {
    const [customers] = await db.query(`SELECT COUNT(*) as total_customers FROM customers`);
    return customers[0].total_customers;
  }

  static async monthlyRevenue() {
    const [revenue] = await db.query(`
      SELECT
        current_month.current_month_sales,
        prev_month.current_month_sales AS prev_total_sales,
        CONCAT(
          ROUND(
            ((current_month.current_month_sales - prev_month.current_month_sales) / prev_month.current_month_sales) * 100,
            2
          ),
          '% from last month'
        ) AS change_percentage
      FROM
        (
          SELECT
            SUM(price_cash) AS current_month_sales
          FROM appointments ap
                 INNER JOIN sales s ON ap.sale_id = s.id
          WHERE ap.status = 'completed'
                  AND YEAR(installation_date) = YEAR(CURDATE())
          AND MONTH(installation_date) = MONTH(CURDATE())
    ) AS current_month
        CROSS JOIN
    (
      SELECT
        SUM(price_cash) AS current_month_sales
      FROM appointments ap
        INNER JOIN sales s ON ap.sale_id = s.id
      WHERE ap.status = 'completed'
        AND YEAR(installation_date) = YEAR(CURDATE() - INTERVAL 1 MONTH)
        AND MONTH(installation_date) = MONTH(CURDATE() - INTERVAL 1 MONTH)
        ) AS prev_month
    `);
    return revenue[0];
  }

  static async todayAppointments() {
    const [appointments] = await db.query(`
      SELECT
        COUNT(*) AS today_appointments
      FROM appointments
      WHERE DATE(installation_date) = CURDATE();
    `,[]);
    return appointments[0].today_appointments;
  }

  static async weekCashPayments() {
    const [payments] = await db.query(`
      SELECT
        COUNT(ap.id) AS week_cash_payments
      FROM appointments ap
      WHERE ap.status = 'completed'
        AND ap.replacement_type = 'out_of_pocket'
        AND DATE(installation_date) >= CURDATE() - INTERVAL 7 DAY;
    `);
    return payments[0].week_cash_payments;
  }

  static async weekInsurancePayments() {
    const [payments] = await db.query(`
      SELECT
        COUNT(ap.id) AS week_insurance_payments
      FROM appointments ap
      WHERE ap.status = 'pending_approval'
        AND ap.replacement_type = 'insurance'
--         AND DATE(installation_date) >= CURDATE() - INTERVAL 7 DAY;
    `);
    return payments[0].week_insurance_payments;
  }

  static async weekGrowthAppointments() {
    const [appointments] = await db.query(`
      SELECT
        current_week.total_appointments AS current_week_appointments,
        prev_week.total_appointments AS prev_week_appointments,
        CONCAT(
          ROUND(
            ((current_week.total_appointments - prev_week.total_appointments) / prev_week.total_appointments) * 100,
            2
          )
        ) AS weekly_change
      FROM
        (
          SELECT
            COUNT(*) AS total_appointments
          FROM appointments
          WHERE status = 'completed'
            AND YEARWEEK(installation_date, 1) = YEARWEEK(CURDATE(), 1)
        ) AS current_week
          CROSS JOIN
        (
          SELECT
            COUNT(*) AS total_appointments
          FROM appointments
          WHERE status = 'completed'
            AND YEARWEEK(installation_date, 1) = YEARWEEK(CURDATE() - INTERVAL 1 WEEK, 1)
        ) AS prev_week;
    `);
    return appointments[0];
  }

  static async last4Jobs() {
    const [appointments] = await db.query(`
      SELECT
        -- Latest 4 appointments
        ap.id,
        ap.installation_date as date,
        ap.installation_time as time,
        ap.status as status,
        ap.replacement_type,
        -- Customer details
        c.fullname as client
      
      FROM appointments ap
             INNER JOIN customers c ON ap.customer_id = c.id
      ORDER BY ID DESC LIMIT 4
    `);
    return appointments;
  }



}

export default dashboardModel;
