import { Calendar, CheckCircle, Users, DollarSign,BookUser, Clock, Wrench, TrendingUp } from 'lucide-react';
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import { fetchDashboardCards } from "slices/thunk.js"
import { Link } from "react-router";
// import { Page } from 'components/Page';
export default function GlassCompanyDashboard() {

  const dispatch = useDispatch();
  const {cards,lastFourJobs} = useSelector((state) => state.dashboard);
  useEffect(() => {
    dispatch(fetchDashboardCards());
  }, [dispatch]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-gray-900 dark:text-white text-3xl font-bold mt-2">{value}</p>
          {subtitle && (
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const JobCard = ({ job }) => (

    <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-gray-900 dark:text-white font-semibold">{job.client}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          job.status === 'Completed'
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            : job.status === 'Scheduled'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              : job.status === 'Pending Approval'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                : job.status === 'Unknown'
                  ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        }`}>
          {job.status}
        </span>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{job.type || 'Service Unknown'}</p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">{job.date}</span>
        <span className={`px-2 py-1 rounded text-xs ${
          job.replacement_type === 'Insurance'
            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
        }`}>
          {job.replacement_type}
        </span>
      </div>
    </div>
  );

  return (
    <div className="
     bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white
     rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Rebate Auto Glass Services
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Dashboard Overview
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Scheduled Jobs"
            value={cards.scheduleCounter}
            subtitle="This week"
            color="blue"
          />
          <StatCard
            icon={CheckCircle}
            title="Completed Jobs"
            value={cards.completedCounter}
            subtitle="This month"
            color="green"
          />
          <StatCard
            icon={Users}
            title="Registered Clients"
            value={cards.customerCounter}
            subtitle="Active customers"
            color="purple"
          />
          <StatCard
            icon={DollarSign}
            title="Monthly Revenue"
            value={`$${cards?.monthlyRevenue?.current_month_sales?.toLocaleString() || 0 }`}
            subtitle={cards?.monthlyRevenue?.change_percentage}
            color="emerald"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Clock}
            title="Active Jobs"
            value={cards.todaysAppointments}
            subtitle="In progress today"
            color="yellow"
          />
          <StatCard
            icon={Wrench}
            title="Insurance Claims"
            value={cards.weekInsurancePayments}
            subtitle="Pending approval"
            color="black"
          />
          <StatCard
            icon={DollarSign}
            title="Cash Payments"
            value={cards.weekCashPayments}
            subtitle="This week"
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            title="Appointments Growth Rate"
            value={(cards?.weekGrowth?.weekly_change || 0) + '%'}
            subtitle="from last week"
            color="red"
          />
        </div>

        {/* Recent Jobs */}
        <div className="bg-white dark:bg-dark-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Jobs
            </h2>
            <Link
              to="/app/invoice/history"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
            >
              View All
            </Link>

          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/*{recentJobs.map((job) => (*/}
            {lastFourJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button className=" rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <Link to="/app/invoice/create" className="p-6">
              <Calendar className="h-8 w-8 mx-auto mb-3 text-blue-500 dark:text-blue-400" />
              <p className="font-medium">Schedule New Job</p>
              <p className="text-sm mt-1 opacity-75">Add a new service appointment</p>
            </Link>
          </button>

          <button className=" rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            <Link to="/app/clients/register" className="p-6">
              <Users className="h-8 w-8 mx-auto mb-3 text-green-500 dark:text-green-400" />
              <p className="font-medium">Add New Client</p>
              <p className="text-sm mt-1 opacity-75">Register a new customer</p>
            </Link>
          </button>

          <button className="rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
            <Link to="/app/clients/all" className="p-6">
              <BookUser className="h-8 w-8 mx-auto mb-3 text-purple-500 dark:text-purple-400" />
              <p className="font-medium">Registered Customers</p>
              <p className="text-sm mt-1 opacity-75">View all registered customers</p>
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
}
