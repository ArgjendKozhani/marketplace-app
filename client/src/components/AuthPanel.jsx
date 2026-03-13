const initialRegisterForm = {
  fullName: '',
  email: '',
  password: '',
  city: '',
  phone: ''
};

const initialLoginForm = {
  email: '',
  password: ''
};

export default function AuthPanel({
  currentUser,
  authMessage,
  authError,
  authMode,
  isOpen,
  loginEmailPrefill,
  onLogin,
  onRegister,
  onLogout,
  onClose,
  onModeChange,
  isAuthLoading
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <section
        className="auth-panel auth-modal"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <button type="button" className="auth-close" onClick={onClose} aria-label="Close authentication dialog">
          �
        </button>

        {currentUser ? (
          <div className="auth-form auth-account-card">
            <span className="eyebrow">Your account</span>
            <h3>Logged in as {currentUser.fullName}</h3>
            <p>You can now publish listings with your account attached to them.</p>
            <div className="auth-user-meta">
              <span>{currentUser.email}</span>
              <span>{currentUser.city}</span>
            </div>
            {authMessage ? <p className="success-text auth-feedback">{authMessage}</p> : null}
            <button type="button" className="primary-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        ) : authMode === 'register' ? (
          <form
            className="auth-form"
            key="register-form"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);

              onRegister({
                fullName: formData.get('fullName'),
                email: formData.get('registerEmail'),
                password: formData.get('registerPassword'),
                city: formData.get('city'),
                phone: formData.get('phone')
              });
            }}
          >
            <span className="eyebrow">Register</span>
            <h3>Create an account</h3>
            <label>
              Full name
              <input name="fullName" defaultValue={initialRegisterForm.fullName} required />
            </label>
            <label>
              Email
              <input name="registerEmail" type="email" defaultValue={initialRegisterForm.email} required />
            </label>
            <label>
              Password
              <input name="registerPassword" type="password" minLength="6" defaultValue={initialRegisterForm.password} required />
            </label>
            <label>
              City
              <input name="city" defaultValue={initialRegisterForm.city} required />
            </label>
            <label>
              Phone
              <input name="phone" defaultValue={initialRegisterForm.phone} />
            </label>
            <button type="submit" className="primary-button" disabled={isAuthLoading}>
              {isAuthLoading ? 'Please wait...' : 'Register'}
            </button>

            <button type="button" className="auth-switch" onClick={() => onModeChange('login')}>
              I already have an account
            </button>
          </form>
        ) : (
          <form
            className="auth-form"
            key={`login-form-${loginEmailPrefill}`}
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);

              onLogin({
                email: formData.get('loginEmail'),
                password: formData.get('loginPassword')
              });
            }}
          >
            <span className="eyebrow">Login</span>
            <h3>Access your account</h3>
            <label>
              Email
              <input name="loginEmail" type="email" defaultValue={loginEmailPrefill || initialLoginForm.email} required />
            </label>
            <label>
              Password
              <input name="loginPassword" type="password" defaultValue={initialLoginForm.password} required />
            </label>
            <button type="submit" className="primary-button" disabled={isAuthLoading}>
              {isAuthLoading ? 'Please wait...' : 'Login'}
            </button>

            <button type="button" className="auth-switch" onClick={() => onModeChange('register')}>
              I need to create an account
            </button>
          </form>
        )}

        {authError ? <p className="error-text auth-feedback">{authError}</p> : null}
        {authMessage && !currentUser ? <p className="success-text auth-feedback">{authMessage}</p> : null}
      </section>
    </div>
  );
}
