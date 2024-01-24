import * as React from 'react';
import { Typography, Grid, Box, Container, TextField, CssBaseline, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { fetchCurrentUser } from '../utils/api';

const BASE_URL = import.meta.env.VITE_PROD_API

const REGISTER_URL = `${BASE_URL}/api/v1/auth/register/`
const LOGIN_URL = `${BASE_URL}/api/v1/auth/login/`

export default function Sign({ theme }) {
  const navigate = useNavigate();
  const [UserEmail, setUserEmail] = React.useState("");
  const [UserName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [cardFlip, setCardFlip] = React.useState(false);

  const handleSendDataLogin = () => {
    if (!UserName || UserName === "")
      return alert("Please enter your username or email")
    if (password === "")
      return alert("Please enter your password")

    axios.post(LOGIN_URL, {
      username: UserName,
      password
    })
      .then(({ data }) => {
        localStorage.setItem("token", data.access_token);
        
        fetchCurrentUser()
          .then((res) => {
            if (res) {
              localStorage.setItem("user", JSON.stringify(res));
            }
          })

        navigate("/Home");
      })
      .catch((err) => {
        console.log(err);
        alert(err?.message ?? "Something went wrong")
      })
  }

  const handleSendDataSignup = () => {
    axios.post(REGISTER_URL, { username: UserName, email: UserEmail, password })
      .then(_ => {
        handleSendDataLogin();
      })
      .catch((err) => {
        console.log(err);
        alert(err?.message ?? "Something went wrong")
      })
  }

  React.useEffect(() => {
    if (localStorage.getItem("token") !== null && localStorage.getItem("token") !== undefined)
      navigate("/Home");
  }, [])


  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <CssBaseline />
      <Grid item sm={false} md={3} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", alignItems: "center" }}  >
      </Grid>

      <Grid item xs={12} md={6} >
        <Container maxWidth="xs">

          <Box sx={{ position: "relative", transformStyle: "preserve-3d", transition: "all 1s ease", transform: cardFlip ? "rotateY(180deg)" : "" }}>

            {/* Front SignIn */}
            <Box sx={{ position: "absolute", inset: "0", backfaceVisibility: "hidden", my: 12, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: "1rem" }} >

              <Box sx={{ width: "9.3rem", }} component="img" src={'Logo.png'} alt='Logo.png' />

              <Box component="form" noValidate onSubmit={e => e.preventDefault()} sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                <TextField onChange={(e) => setUserName(e.target.value)} fullWidth sx={{ borderRadius: "5px" }} id="Username" label="Username" name="Username" autoComplete="Username" autoFocus />
                <TextField onChange={(e) => setPassword(e.target.value)} fullWidth sx={{ borderRadius: "5px" }} name="password" label="Password" type="password" id="password" autoComplete="current-password" />

                <Button type="submit" fullWidth variant="contained" onClick={handleSendDataLogin}>Login</Button>

                <Typography component="p" variant="subtitle1" textAlign="center" >Don’t have an account?<Button variant="text" sx={{ textTransform: "none" }} onClick={() => setCardFlip(true)}>Sign Up</Button></Typography>

              </Box>

            </Box>

            {/* Back SignUp */}
            <Box sx={{ position: "absolute", inset: "0", backfaceVisibility: "hidden", transform: "rotateY(180deg)", my: { xs: 4, sm: 8 }, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: ".8rem" }} >

              <Box sx={{width:"9.3rem"}} component="img" src={'Logo.png'} alt='Logo.png' />

              <Typography component="p" variant="subtitle1" textAlign="center">Sign up to see photos and videos from your friends</Typography>

              <Box component="form" noValidate onSubmit={e => e.preventDefault()} sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                <TextField required fullWidth sx={{ borderRadius: "5px" }} onChange={(e) => setUserEmail(e.target.value)} id="Email" label="Email" name="Email" autoComplete="Email" autoFocus />
                <TextField required fullWidth sx={{ borderRadius: "5px" }} onChange={(e) => setUserName(e.target.value)} id="Username" label="Username" name="Username" autoComplete="Username" autoFocus />
                <TextField required fullWidth sx={{ borderRadius: "5px" }} onChange={(e) => setPassword(e.target.value)} name="password" label="Password" type="password" id="password" autoComplete="current-password" />

                <Button type="submit" fullWidth variant="contained" onClick={handleSendDataSignup}>Sign Up</Button>

                <Typography component="p" variant="subtitle1" textAlign="center">By signing up, you agree to our Terms, Data Policy and Cookies Police</Typography>

                <Typography component="p" variant="subtitle1" textAlign="center">Have an account? <Button variant="text" sx={{ textTransform: "none" }} onClick={() => setCardFlip(false)}>Log In</Button></Typography>

              </Box>

            </Box>

          </Box>

        </Container>
      </Grid>


    </Grid>
  );
}