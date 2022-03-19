import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import authApi from "../../apis/authApi";

import { useLocation, useHistory } from "react-router-dom";
import { useEffect } from "react";

const VerifyEmail = () => {
   const search = useLocation().search;
   let history = useHistory();

   const handelRedirect = () => {
      history.push("/login");
   };

   const card = (
      <React.Fragment>
         <CardContent
            sx={{
               width: 400,
            }}
         >
            <Box>
               <CheckCircleIcon
                  sx={{
                     fontSize: 70,
                     fill: "#5a9cff",
                  }}
               />
            </Box>
            <Typography
               sx={{ fontSize: 25 }}
               color="text.primary"
               fontWeight={600}
               gutterBottom
            >
               Verified
            </Typography>
            <Typography color="text.secondary">
               You have been successfully verified email.
            </Typography>
         </CardContent>
         <CardActions
            sx={{
               justifyContent: "center",
            }}
         >
            <Button
               onClick={handelRedirect}
               variant="contained"
               sx={{
                  width: "200px",
                  fontSize: 18,
                  mb: "10px",
                  background: "#5a9cff",
                  borderRadius: "6px",
               }}
            >
               Ok
            </Button>
         </CardActions>
      </React.Fragment>
   );

   useEffect(() => {
      const fetchVerify = async () => {
         try {
            const user_id = new URLSearchParams(search).get("user_id");
            const token = new URLSearchParams(search).get("token");
            const data = {
               user_id,
               token,
            };

            console.log(data);
            let res = await authApi.verify(data);

            console.log(res);
         } catch (error) {
            console.log(
               "Can't find params user_id and token to verify kien dep trai 108 ahihi"
            );
         }
      };
      fetchVerify();
   }, []);

   return (
      <Box
         sx={{
            minWidth: 275,
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgb(90, 156, 255, 0.3)",
         }}
      >
         <Card sx={{ borderRadius: "6px" }} variant="outlined">
            {card}
         </Card>
      </Box>
   );
};

export default VerifyEmail;
