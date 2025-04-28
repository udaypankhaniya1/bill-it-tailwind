
import AuthForm from '@/components/AuthForm';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-invoice-blue">InvoiceMaster</h1>
          <p className="text-gray-600">Generate professional invoices</p>
        </div>
        <AuthForm isLogin={true} />
      </div>
    </div>
  );
};

export default Login;
