//import settings
import {QueryClientProvider, QueryClient} from "react-query";
import {ReactQueryDevtools} from "react-query/devtools";
import {Routes, Route} from "react-router-dom";

//import components
import P1 from "./components/P1";
import LogIn from "./components/LogIn";
import SignUp from "./components/SignUp";
import NotFound from "./components/NotFound";
import Home from "./components/Home";

const queryClient=new QueryClient();

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <div className="App">
            <Routes>
                <Route path={'/'} element={<P1/>}/>
                <Route path={'/LogIn'} element={<LogIn/>}/>
                <Route path={'/SignUp'} element={<SignUp/>}/>
                <Route path={'*'} element={<NotFound/>}/>
                <Route path={'/Home'} element={<Home/>}>

                </Route>
            </Routes>
        </div>
        <ReactQueryDevtools initialIsOpen={false} position={"bottom-right"}/>
      </QueryClientProvider>
  );
}

export default App;
