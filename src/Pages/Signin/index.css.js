const styles = theme => {
  console.log(theme);
  return {
    paper: {
      maxWidth: "400px",
      margin: "auto",
      marginTop: theme.spacing.unit * 8,
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    avatar: {},
    typography: {},
    button: {
      height: "40px",
    },
  };
};

export default styles;
