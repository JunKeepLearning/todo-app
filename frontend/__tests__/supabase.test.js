(async () => {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js');
  
    const supabase = createClient(
      'https://sgmztfhavavvlvhovhib.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnbXp0ZmhhdmF2dmx2aG92aGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NzM1MTIsImV4cCI6MjA1NjE0OTUxMn0.UUCq0SjgtwLmdZKKJvnmz5NU1a2CI92DuJgD1aSRdAc'
    );
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'yourpassword'
    });
  
    console.log('登录测试结果:', data, error);
  })();
  