import RoutesComponent from './components/RoutesComponent';
import { AlertProvider } from './provider/AlertProvider';
import AuthenticationProvider from './provider/AuthenticationProvider';
import { SearchProvider } from './provider/SearchProvider';

function App() {
  return (
    <>
      {/* Use the Authentication provider to enable authentication and give authcontext */}
      <AuthenticationProvider>
        <AlertProvider>
          <SearchProvider>
            <RoutesComponent />
          </SearchProvider>
        </AlertProvider>
      </AuthenticationProvider>
    </>
  );
}
export default App;
