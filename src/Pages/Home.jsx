/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Swiper } from "swiper/react";
import { Virtual } from "swiper/modules";
import "swiper/css";
import "swiper/css/virtual";
import {
  Card,
  Grid,
  CardContent,
  Box,
  CardHeader,
  Typography,
  CardMedia,
  IconButton,
  Paper,
  CardActions,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import {
  fetchLatestFeed,
  fetchUserById,
  fetchCurrentUser,
  retrieveImage,
  fetchLikesForImage,
  likeImage,
  unlikeImage,
} from "../utils/api";

import EmptyIcon from "@mui/icons-material/RemoveCircleOutline"; // Import an icon that fits the empty state
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import CommentIcon from "@mui/icons-material/CommentOutlined";

const CustomEmptyStateComponent = () => {
  return (
    <Paper elevation={0} sx={{ padding: "2rem", textAlign: "center" }}>
      <EmptyIcon sx={{ fontSize: "5rem", color: "grey.500" }} />
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
    if (
      localStorage.getItem("token") === null ||
      localStorage.getItem("token") === undefined
    )
      navigate("/");

    prepareFeed();
  }, []);

  async function prepareFeed() {
    try {
      await getAdmin();
      const beforeDate = new Date(); // Current date-time
      beforeDate.setDate(beforeDate.getDate() + 1); // Adding one day buffer for timezones

      const afterDate = new Date(0); // Start of UNIX time

      const latestPosts = await fetchLatestFeed(
        beforeDate.toISOString(),
        afterDate.toISOString()
      );
      setAllPosts(latestPosts?.results);

      // console.log("latestPosts posts", latestPosts)

      // Fetch user details and images for each post
      const postsWithDetailsPromises = latestPosts?.results.map(
        async (post) => {
          const userDetails = await fetchUserById(post.creator);
          const { likes } = await fetchLikesForImage(post.id);

          let imageUrl;
          try {
            const imageBlob = await retrieveImage(post.download_url); // Fetch image as a blob
            imageUrl = URL.createObjectURL(imageBlob); // Create a local URL to be used as an image source
          } catch (e) {
            // In case of failure: load image of question mark from data URI
            imageUrl =
              "data:image/png;base64,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";
          }

          return {
            ...post,
            likes,
            user: userDetails, // Assuming fetchUserById returns the user details
            image: imageUrl, // Local URL for the image blob
          };
        }
      );

      let postsWithDetails = await Promise.all(postsWithDetailsPromises);
      postsWithDetails = postsWithDetails.filter((post) => !!post);

      setAllPosts(postsWithDetails);
    } catch (error) {
      console.log("Error preparing feed:", error);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  async function getAdmin() {
    try {
      setAdmin(
        JSON.parse(localStorage.getItem("user"))
          ? JSON.parse(localStorage.getItem("user"))
          : { avatar: "", userName: "", email: "" }
      );
    } catch (err) {
      try {
        const res = await fetchCurrentUser();
        if (res) {
          setAdmin(res);
          localStorage.setItem("user", JSON.stringify(res));
        } else {
          handleLogout();
        }
      } catch (err) {
        console.log(err);
        handleLogout();
      }
    }
  }

  if (!Admin) {
    return <h1>Loading...</h1>;
  }

  return (
    <>
      <Grid container>
        <Grid item xs={12} md={7}>
          <Swiper
            slidesPerView={2}
            modules={[Virtual]}
            virtual
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
          ></Swiper>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
              mt: "2rem",
            }}
          >
            {AllPosts.length === 0 ? (
              <CustomEmptyStateComponent />
            ) : (
              AllPosts.map((post) => (
                <Post key={post.id} post={post} admin={Admin} />
              ))
            )}
          </Box>
        </Grid>

        <Grid
          item
          xs={0}
          md={5}
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "start",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Card
            sx={{
              display: "flex",
              background: "none",
              width: "65%",
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              sx={{ width: "20%", borderRadius: "50%" }}
              image={Admin.avatar}
            />
            <CardContent
              sx={{
                flex: "1 0 auto",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography component="div" variant="h5">
                {Admin.userName}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                component="div"
              >
                {Admin.email}
              </Typography>
            </CardContent>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={handleLogout}
                aria-label="previous"
                color="info"
                sx={{ borderRadius: "0", fontSize: ".9rem" }}
              >
                {" "}
                Log out
              </IconButton>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}

function Post({ post, admin }) {
  const [userLikedPost, setUserLikedPost] = useState(false);

  const effectiveLikeCount = useMemo(() => {
    // Return raw like count if we don't have like data yet
    if (!post.likes) return post.like_count;

    let count = post.like_count;
    if (userLikedPost && !post.likes.find((like) => like.id === admin.id)) {
      // User liked post and it's not in original like state
      // => Increment effective count
      count++;
    }
    if (!userLikedPost && post.likes.find((like) => like.id === admin.id)) {
      // User didn't like post and it IS in original like state
      // => Decrement effective count
      count--;
    }
    return count;
  }, [admin.id, post.like_count, post.likes, userLikedPost]);

  useEffect(() => {
    if (post.likes) {
      const adminLike = post.likes.find((like) => like.id === admin.id);
      setUserLikedPost(!!adminLike);
    }
  }, [admin.id, post.like_count, post.likes]);

  const handleLike = useCallback(() => {
    setUserLikedPost((prev) => {
      // Toggle last choice
      const isLiked = !prev;
      // Like or unlike image accordingly
      isLiked ? likeImage(post.id) : unlikeImage(post.id);
      return isLiked;
    });
  }, [post.id]);

  return (
    <Card sx={{ maxWidth: "100%" }} key={post.id}>
      <CardHeader
        title={post.user?.username}
        subheader={post.created_at.split(" ")[0]}
      />

      {
        <CardMedia
          component="img"
          height="300"
          image={post.image}
          sx={{ objectFit: "contain" }}
        />
      }
      <CardActions>
        <Tooltip title={userLikedPost ? "Unlike" : "Like"} placement="top">
          <IconButton
            size="small"
            color={userLikedPost ? "like" : "default"}
            onClick={handleLike}
          >
            {userLikedPost ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Comment" placement="top">
          <IconButton size="small" color="default">
            <CommentIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
      <CardContent sx={{ py: 0 }}>
        <Typography>
          {effectiveLikeCount} like{effectiveLikeCount === 1 ? "" : "s"}
        </Typography>
      </CardContent>

      {post?.caption && (
        <CardContent>
          <Typography>
            <strong>{post.user?.username}</strong> {post.caption}
          </Typography>
        </CardContent>
      )}
    </Card>
  );
}
