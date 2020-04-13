// core
import React, { useState, useEffect } from 'react';
import { usePosition } from 'use-position';
import _ from 'lodash';

// material-ui
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import PersonPinIcon from '@material-ui/icons/PersonPin';
import GitHubIcon from '@material-ui/icons/GitHub';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import LinearProgress from '@material-ui/core/LinearProgress';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import TextField from '@material-ui/core/TextField';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Map from "./components/Map";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      {new Date().getFullYear()}
      {' Common Computer Inc.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
  categoryActive: {
    backgroundColor: theme.palette.primary.main
  },
  categoryDefault: {
    cursor: "pointer"
  }
}));

const categories = [
  {val: 0, name: 'Supermarket'},
  {val: 1, name: 'Shopping Mall'},
  {val: 2, name: 'Restaurant'},
  {val: 3, name: 'Cafe'},
  {val: 4, name: 'Hospital'},
  {val: 5, name: 'Pharmacy'},
  {val: 6, name: 'Bank'}
];

const days = [
  {val: -1, name: 'Live Data'},
  {val: 0, name: 'Sunday'},
  {val: 1, name: 'Monday'},
  {val: 2, name: 'Tuesday'},
  {val: 3, name: 'Wednesday'},
  {val: 4, name: 'Thursday'},
  {val: 5, name: 'Friday'},
  {val: 6, name: 'Saturday'}
];

const times = [
  {val: -1, name: 'Historic Avg'},
  {val: 0, name: '12 AM'},
  {val: 1, name: '1 AM'},
  {val: 2, name: '2 AM'},
  {val: 3, name: '3 AM'},
  {val: 4, name: '4 AM'},
  {val: 5, name: '5 AM'},
  {val: 6, name: '6 AM'},
  {val: 7, name: '7 AM'},
  {val: 8, name: '8 AM'},
  {val: 9, name: '9 AM'},
  {val: 10, name: '10 AM'},
  {val: 11, name: '11 AM'},
  {val: 12, name: '12 PM'},
  {val: 13, name: '1 PM'},
  {val: 14, name: '2 PM'},
  {val: 15, name: '3 PM'},
  {val: 16, name: '4 PM'},
  {val: 17, name: '5 PM'},
  {val: 18, name: '6 PM'},
  {val: 19, name: '7 PM'},
  {val: 20, name: '8 PM'},
  {val: 21, name: '9 PM'},
  {val: 22, name: '10 PM'},
  {val: 23, name: '11 PM'}
];

function TimeMenu(props) {
  const { anchorEl, handleCloseTimeMenu, handleCloseDayMenu } = props;

  const handleClose = () => {
    handleCloseTimeMenu();
  };

  const handleListItemClick = (event) => {
    handleCloseTimeMenu(event);
    handleCloseDayMenu();
  };

  return (
    <Menu
      id="time-menu"
      anchorEl={anchorEl}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleClose}
      style={{left: '110px', height: '600px'}}
    >
      {times.map((item, index) => 
        <MenuItem
          key={index}
          value={item.val}
          onClick={handleListItemClick}
        >
          {item.name}
        </MenuItem>
      )}
    </Menu>
  );
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function LocationSnackbar(props) {
  const classes = useStyles();
  const { setSnackbarOpen, snackbarOpen } = props;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarOpen(false);
  };

  return (
    <div className={classes.root}>
      <Snackbar open={snackbarOpen} autoHideDuration={10000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning">
          Please turn on your location services and refresh this page!
        </Alert>
      </Snackbar>
    </div>
  );
}

const getViewUrl = (location) => {
  return `https://maps.google.com/?q=${encodeURIComponent(location.address)}`;
}

const getDirectionsUrl = (location) => {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`;
}

const getLocations = (category, latitude, longitude, zoom) => {
  console.log('\nCATEGORYYYYY',category,'\n')
  return new Promise((resolve, reject) => {
    fetch(`/api/locations?category=${category}&latitude=${latitude}&longitude=${longitude}&zoom=${zoom}`)
      .then(res => res.json())
      .then(locations => resolve(locations));
  });
}

export default function App() {
  const classes = useStyles();

  const statusMappings = {
    'Not busy': '#66cdaa',
    'Not too busy': '#66cdaa',
    'Less busy than usual': '#66cdaa',
    'A little busy': '#ffa500',
    'As busy as it gets': '#f998a5',
    'Busier than usual': '#f998a5',
    'Usually not busy': '#66cdaa',
    'Usually not too busy': '#66cdaa',
    'Usually a little busy': '#ffa500',
    'Usually as busy as it gets': '#f998a5'
  };

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ locations: [] });
  const { latitude, longitude, error } = usePosition(true);
  const [mapCoords, setMapCoords] = useState({lat: latitude, lng: longitude});
  const [zoom, setZoom] = useState(0);

  const handleChangeCategory = (event) => {
    setCategory(event.target.value);
    setCategoryAnchorEl(null);
  }

  const handleChangeDay = (event) => {
    setDay(event.target.value);
    if (event.target.value > -1) {
      setTimeAnchorEl(event.currentTarget);
    } else {
      handleCloseDayMenu();
    }
  }

  const handleSearch = async () => {
    const query = searchText;
    setSearchText('');
    const result = await getLocations(query);
    if (!result) return;
    const data = {
      locations: _.uniqBy(result.locationInfoList, 'name')
    };
    setData(data);
  }

  const handleChangeText = (event) => {
    setSearchText(event.target.value);
  }

  const handleCloseCategoryMenu = (event) => {
    setCategoryAnchorEl(null);
  }

  const handleCloseDayMenu = (event) => {
    setDayAnchorEl(null);
  }

  const handleCloseTimeMenu = (event) => {
    setTimeAnchorEl(null);
    if (event && event.target) {
      setTime(event.target.value);
    }
    console.log("current day and time:", day, time)
  }

  // for snackbar 
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);

  const [searchText, setSearchText] = useState('');

  // for category
  const [category, setCategory] = useState(0);
  const [day, setDay] = useState(-1);
  const [time, setTime] = useState(-1);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState(null);
  const [dayAnchorEl, setDayAnchorEl] = useState(null);
  const [timeAnchorEl, setTimeAnchorEl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const promises = [];
      promises.push(getLocations(categories[category].name, mapCoords.lat, mapCoords.lng, zoom));
      if (category === 0) {
        promises.push(getLocations('Grocery store', mapCoords.lat, mapCoords.lng, zoom));
      }
      const result = await Promise.all(promises);
      if (!result || !result.length) {
        return; // setData({ locations: [] }) ?
      }
      const data = {
        locations: result[0].locationInfoList
      };

      if (result[1]) {
        data.locations = data.locations.concat(result[1].locationInfoList);
      }

      // remove duplicates
      data.locations = _.uniqBy(data.locations, 'name');

      setData(data);
    };

    fetchData();
  }, [category]);

  useEffect(() => {
    const fetchData = async () => {
      const promises = [];
      promises.push(getLocations(categories[category].name, mapCoords.lat, mapCoords.lng, zoom));
      if (category === 0) {
        promises.push(getLocations('Grocery store', latitude, longitude));
      }
      const result = await Promise.all(promises);
      console.log("result:",result)
      if (!result || !result.length) {
        return; // setData({ locations: [] }) ?
      }
      const data = {
        locations: result[0].locationInfoList
      };

      if (result[1]) {
        data.locations = data.locations.concat(result[1].locationInfoList);
      }

      // remove duplicates
      data.locations = _.uniqBy(data.locations, 'name');

      setData(data);
    };
    fetchData();
  }, [mapCoords]);

  useEffect(() => {
    // TODO(lia): select only the places that have the time data
  }, [time]);

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <PersonPinIcon className={classes.icon} />
          <Typography variant="h5" color="inherit" noWrap>
            Crowdy
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth="md">
            <Typography component="h1" variant="h2" align="left" color="textPrimary" paragraph>
              Find supermarkets near you that are not crowded!
              Based on <Link color="primary" href="https://support.google.com/business/answer/6263531?hl=en">popular times data*</Link> from Google Maps
            </Typography>
            <Typography variant="subtitle1" align="left" color="textSecondary" paragraph>
              * Data might not be 100% accurate as it is obtained via web scraping
            </Typography>
            <LocationSnackbar snackbarOpen={snackbarOpen} setSnackbarOpen={setSnackbarOpen} />
          </Container>
        </div>
        <Container className={classes.cardGrid} maxWidth="md">
          {loading && <LinearProgress />}
          {/* End hero unit */} 
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
              <TextField
                style={{display: 'flex', flex: 5}}
                hintText='Search...'
                variant="outlined"
                value={searchText}
                onChange={handleChangeText}
                onKeyPress={(event) => {
                  if (event.key === 'Enter') {
                      handleSearch();
                      event.preventDefault();      
                  }
                }}
              />
              <Button style={{display: 'flex', flex: 1}} onClick={handleSearch}>
                Search
              </Button>
            </div>
            <div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'space-between'}}>
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Button
                  aria-controls="simple-menu" aria-haspopup="true" onClick={(event) => setCategoryAnchorEl(event.currentTarget)}
                >
                  Select Category
                </Button>
                <Menu
                  id="select-category"
                  displayEmpty
                  inputProps={{ 'aria-label': 'Without label' }}
                  onClose={handleCloseCategoryMenu}
                  open={Boolean(categoryAnchorEl)}
                  anchorEl={categoryAnchorEl}
                >
                  {categories.map((item, index) => 
                    <MenuItem onClick={handleChangeCategory} value={item.val}>{item.name}</MenuItem>
                  )}
                </Menu>
                
                <Button
                  aria-controls="simple-menu" aria-haspopup="true" onClick={(event) => setDayAnchorEl(event.currentTarget)}
                >
                  When
                </Button>
                <Menu
                  id="day-menu"
                  keepMounted
                  open={Boolean(dayAnchorEl)}
                  onClose={handleCloseDayMenu}
                  anchorEl={dayAnchorEl}
                >
                  {days.map((item, index) => 
                    <MenuItem key={index} onClick={handleChangeDay} value={item.val}>{item.name}</MenuItem>
                  )}
                </Menu>

                <TimeMenu
                  anchorEl={timeAnchorEl}
                  onClose={() => setTimeAnchorEl(null)}
                  handleCloseTimeMenu={handleCloseTimeMenu}
                  handleCloseDayMenu={handleCloseDayMenu}
                />
              </div>
              <Button>
                Exclude no time data
              </Button>
            </div>
          </div>
          <Map
            data={data}
            userGps={{latitude, longitude}}
            setZoom={setZoom}
            setMapCoords={setMapCoords}
            loading={loading}
            setLoading={setLoading}
          />
        </Container>
      </main>
      {/* Footer */}
      <footer className={classes.footer}>
        <Grid container direction="row" justify="space-between">
          <Grid container style={{maxWidth: '300px'}} direction="row">
            <Grid item>
              <Link color="inherit" href="https://ainize.ai">
                POWERED BY AINIZE
              </Link>
            </Grid>
            <Grid item style={{marginLeft: '16px'}}>
              <Link color="inherit" href="https://github.com/liayoo/crowdy">
                VISIT GITHUB
              </Link>
            </Grid>
          </Grid>
          <Copyright />
        </Grid>
      </footer>
      {/* End footer */}
    </React.Fragment>
  );
}