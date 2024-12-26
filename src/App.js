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
import BrowseBooks from "./components/BrowseBooks";
import MyBooks from "./components/MyBooks";
import Posts from "./components/Posts";
import MyPosts from "./components/MyPosts";
import BookDetail from "./components/BookDetail";
import MyBookDetail from "./components/MyBookDetail";
import PostDetail from "./components/PostDetail";
import MyPostDetail from "./components/MyPostDetail";
import CreatePost from "./components/CreatePost";

// Query client
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
                    <Route path={'BrowseBooks'} element={<BrowseBooks/>}/>
                    <Route path={'MyBooks'} element={<MyBooks/>}/>
                    <Route path={'Posts'} element={<MyPosts/>}/>
                    <Route path={'MyPosts'} element={<Posts/>}/>
                    <Route path={'BookDetail'} element={<BookDetail/>}/>
                    <Route path={'MyBookDetail'} element={<MyBookDetail/>}/>
                    <Route path={'PostDetail'} element={<PostDetail/>}/>
                    <Route path={'MyPostDetail'} element={<MyPostDetail/>}/>
                    <Route path={'CreatePost'} element={<CreatePost/>}/>
                </Route>
            </Routes>
        </div>
        <ReactQueryDevtools initialIsOpen={false} position={"bottom-right"}/>
      </QueryClientProvider>
  );
}

export default App;
