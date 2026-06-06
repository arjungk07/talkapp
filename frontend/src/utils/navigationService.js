// The Problem: You cannot import useNavigate into api.js because api.js is not a component. 
// If you try, React will throw an "Invalid hook call" error because you are calling a hook outside of a React component's lifecycle.

let navigate;

export const setNavigate = (nav) => {
  navigate = nav;
};

export const navigateTo = (path) => {
  if (navigate) navigate(path);
};