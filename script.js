console.log("SpaceYisus Shop theme loaded");

import { supabase } from './supabase.js';

// Test database connection
async function checkDB() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
  } else {
    console.log('✅ Conexión exitosa a Supabase. Registros:', data);
  }
}

// Run the connection test
checkDB();

// 🔹 Registro
async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  if (error) {
    alert('Error al registrar: ' + error.message);
  } else {
    alert('✅ Usuario registrado con éxito');
    // Redirigir al login después de registro exitoso
    window.location.href = 'login.html';
  }
}

// 🔹 Login
async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    alert('Error al iniciar sesión: ' + error.message);
  } else {
    alert('✅ Sesión iniciada correctamente');
    window.location.href = 'index.html';
  }
}

// Manejo de formularios
document.addEventListener('DOMContentLoaded', () => {
  // Registro
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = e.target.email?.value;
      const password = e.target.password?.value;
      const confirmPassword = e.target['confirm-password']?.value;
      
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      
      if (email && password) {
        registerUser(email, password);
      }
    });
  }

  // Login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = e.target.email?.value;
      const password = e.target.password?.value;
      if (email && password) {
        loginUser(email, password);
      }
    });
  }
});
>>>>>>> b4e4c3b (Integración de Supabase para login y registro)
