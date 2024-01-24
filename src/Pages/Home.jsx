import React, { useEffect } from 'react'
import { Swiper } from "swiper/react";
import { Virtual } from 'swiper/modules';
import "swiper/css";
import 'swiper/css/virtual';
import { Card, Grid, CardContent, Box, CardHeader, Typography, CardMedia, IconButton, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { fetchLatestFeed, fetchUserById, fetchCurrentUser, retrieveImage } from '../utils/api';


import EmptyIcon from '@mui/icons-material/RemoveCircleOutline'; // Import an icon that fits the empty state

const CustomEmptyStateComponent = () => {
  return (
    <Paper elevation={0} sx={{ padding: '2rem', textAlign: 'center' }}>
      <EmptyIcon sx={{ fontSize: '5rem', color: 'grey.500' }} />
      <Typography variant="h5" color="text.secondary">
        Wow, much empty
      </Typography>
      <Typography variant="body1" color="text.secondary">
        There&apos;s nothing here... yet!
      </Typography>
    </Paper>
  );
};


export default function Home() {
    const [AllPosts, setAllPosts] = React.useState([]);
    const [Admin, setAdmin] = React.useState();
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem("token") === null || localStorage.getItem("token") === undefined)
            navigate("/");

        prepareFeed();
    }, [])


    async function prepareFeed() {
        try {
            await getAdmin();
            const beforeDate = new Date(); // Current date-time
            beforeDate.setDate(beforeDate.getDate() + 1); // Adding one day buffer for timezones
    
            const afterDate = new Date(0); // Start of UNIX time
    
            const latestPosts = await fetchLatestFeed(beforeDate.toISOString(), afterDate.toISOString());
            setAllPosts(latestPosts?.results);

            // console.log("latestPosts posts", latestPosts)

            
            // Fetch user details and images for each post
            const postsWithDetailsPromises = latestPosts?.results.map(async (post) => {
                const userDetails = await fetchUserById(post.creator);
                const imageBlob = await retrieveImage(post.download_url); // Fetch image as a blob
                const imageUrl = URL.createObjectURL(imageBlob); // Create a local URL to be used as an image source

                return {
                    ...post,
                    user: userDetails, // Assuming fetchUserById returns the user details
                    image: imageUrl    // Local URL for the image blob
                };
            });
    
            const postsWithDetails = await Promise.all(postsWithDetailsPromises);

            setAllPosts(postsWithDetails);

        } catch (error) {
            console.log('Error preparing feed:', error);
        }
    }
    




    function handleLogout() {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        navigate("/")
    }


    async function getAdmin () {
        try {
            setAdmin(JSON.parse(localStorage.getItem("user")) ? JSON.parse(localStorage.getItem("user")) : { avatar: "", userName: "", email: "" })
        } catch (err) {
            try {
                const res = await fetchCurrentUser()
                if (res) {
                    setAdmin(res)
                    localStorage.setItem("user", JSON.stringify(res));
                } else {
                    handleLogout()
                }
            } catch (err) {
                console.log(err);
                handleLogout();
            }
        }
    }

    if (!Admin) { 
        return <h1>Loading...</h1>
    }

    return (
        <>
            <Grid container >

                <Grid item xs={12} md={7} >
                    <Swiper slidesPerView={2} modules={[Virtual]} virtual
                        breakpoints={{
                            300: {
                                slidesPerView: 3,
                            },
                            600: {
                                slidesPerView: 4,
                            },
                            768: {
                                slidesPerView: 5,
                            },
                            1024: {
                                slidesPerView: 7,
                            },
                        }}
                    >
                    </Swiper>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem", mt: "2rem" }}>

                        {AllPosts.length === 0 ? <CustomEmptyStateComponent /> : AllPosts.map(post => (
                                <Card sx={{ maxWidth: "100%" }} key={post.id}>
                                    <CardHeader
                                        title={post.user?.username}
                                        subheader={post.created_at.split(' ')[0]}
                                    />

                                    {<CardMedia
                                        component="img"
                                        height="300"
                                        image={post.image}
                                        // alt="Paella dish"
                                        sx={{ objectFit: "contain" }}
                                    />}
                                </Card>
                            ))}
                    </Box>

                </Grid>

                <Grid item xs={0} md={5} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "start", alignItems: "center", flexDirection: "column" }}>

                    <Card sx={{ display: 'flex', background: "none", width: "65%", alignItems: "center" }}>
                        <CardMedia component="img" sx={{ width: "20%", borderRadius: "50%" }} image={Admin.avatar} />
                        <CardContent sx={{ flex: '1 0 auto', flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                            <Typography component="div" variant="h5">
                                {Admin.userName}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" component="div">
                                {Admin.email}
                            </Typography>
                        </CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton onClick={handleLogout} aria-label="previous" color='info' sx={{ borderRadius: "0", fontSize: ".9rem" }}> Log out</IconButton>
                        </Box>
                    </Card>

                </Grid>

            </Grid>
        </>
    )
}
