export default function DashboardLoading() {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <div
        style={{
          animation: 'spin 1s linear infinite',
          border: '3px solid #1e293b',
          borderRadius: '50%',
          borderTopColor: '#6366f1',
          height: 32,
          width: 32,
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
