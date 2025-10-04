import dashboardModel from "../models/dashboard.js";

export const GetDashboardCards = async (req, res) => {
  try {
    //(1) Get the count of schedule appointments
		const scheduleCounter = await dashboardModel.scheduleCount();

		//(2) Get the count of completed appointments
	  const completedCounter = await dashboardModel.MonthCompletedCount();

		//(3) Get the count of customers
    const customerCounter = await dashboardModel.customerCount();

		// (4) Get the monthly revenue
    const monthlyRevenue = await dashboardModel.monthlyRevenue();

		// (5) get Todays appointments
    const todaysAppointments = await dashboardModel.todayAppointments();

		//(6) Get week cash payments
		const weekCashPayments = await dashboardModel.weekCashPayments();

		// (7) Get week insurance payments
    const weekInsurancePayments = await dashboardModel.weekInsurancePayments();

		//(8) Get the week growth
    const weekGrowth = await dashboardModel.weekGrowthAppointments();

		// (9) Get the last 4 jobs
	  const lastFourJobs = await dashboardModel.last4Jobs();
    res.status(200).json({
	    data: {
        scheduleCounter,
        completedCounter,
	      customerCounter,
        monthlyRevenue,
		    todaysAppointments,
		    weekCashPayments,
		    weekInsurancePayments ,
		    weekGrowth,
		    lastFourJobs
	    },
			message: "Dashboard cards retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
