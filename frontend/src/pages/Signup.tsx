import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Construct payload safely removing empty optionals
    const payload: any = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: 'admin' // Force role to admin as requested
    };

    try {
      await api.post('/create-user', payload);
      toast.success('Account created successfully! You can now log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-40 -left-10 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
             <Building2 className="w-10 h-10 text-primary-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Join the platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 w-full">
        <div className="glass-card py-8 px-4 sm:rounded-2xl sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
            
            <Input
              label="Email address"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            {/* Role selection removed, defaults to Admin */}

            <Button type="submit" className="w-full mt-2" size="lg" isLoading={isLoading}>
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-600 border-t border-slate-200 pt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
