import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import HomeIcon from '@mui/icons-material/Home';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ResponsiveDrawerListItem from "./ResponsiveDrawerListItem";
import { useNavigate, Outlet } from 'react-router-dom';
import TransitionsModal from './TransitionsModal';


const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

export default function MainHome({ theme, setTheme }) {
    const navigate = useNavigate();

    const [open, setOpen] = React.useState(false);
    const [openTransitionsModal, setOpenTransitionsModal] = React.useState(false);

    const [Admin, setAdmin] = React.useState();

    function handleAdminUpdate() {
        try {
            setAdmin(JSON.parse(localStorage.getItem("user")));
        } catch (error) {
            console.log(error);
            navigate("/");
        }
    }

    React.useEffect(() => {
        handleAdminUpdate();
    }, [])

    

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <Drawer variant="permanent" open={open} >
                <TransitionsModal openTransitionsModal={openTransitionsModal} setOpenTransitionsModal={setOpenTransitionsModal} />
                <List sx={{ height: "100%", display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
                    <Box>
                        <ResponsiveDrawerListItem Text="Home" Icon={<HomeIcon />} onClick={() => navigate("/Home")} open={open} />
                        <ResponsiveDrawerListItem Text="Create" Icon={<AddCircleOutlineIcon />} open={open} onClick={() => setOpenTransitionsModal(!openTransitionsModal)} />
                    </Box>
                </List>

            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, height: "100vh" }}>
                <Outlet />
            </Box>
        </Box>
    );
}


