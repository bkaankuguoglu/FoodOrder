/* Database export results for db Group_6_db */

/* Preserve session variables */
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS=0;

/* Export data */

/* data for Table address */
INSERT INTO `address` VALUES (10248,"","","","Bati");
INSERT INTO `address` VALUES (19822,"1","2","3","Koc");
INSERT INTO `address` VALUES (43483,"1","3","4","Bati");
INSERT INTO `address` VALUES (47174,"","","","Bati");
INSERT INTO `address` VALUES (47561,"1","2","3","Koc");
INSERT INTO `address` VALUES (52437,"1","2","3","Koc");
INSERT INTO `address` VALUES (58774,"","","","Bati");
INSERT INTO `address` VALUES (74278,"15","asd","asd","Bati");
INSERT INTO `address` VALUES (74438,"","","","Bati");
INSERT INTO `address` VALUES (80107,"","","","Bati");
INSERT INTO `address` VALUES (83579,"","","","Bati");
INSERT INTO `address` VALUES (88205,"155","155","Istanbul","Koc");
INSERT INTO `address` VALUES (88641,"5","sabancÄ±","lebron","Bati");
INSERT INTO `address` VALUES (89764,"","","","Bati");
INSERT INTO `address` VALUES (95390,"","","","Bati");
INSERT INTO `address` VALUES (96396,"1","2","3","Koc");
INSERT INTO `address` VALUES (12345678,"1","12","Istanbul","Bati");

/* data for Table c_mi */
INSERT INTO `c_mi` VALUES (12,5951623,1);

/* data for Table c_pro */
INSERT INTO `c_pro` VALUES (5951623,321,1);

/* data for Table cart */
INSERT INTO `cart` VALUES (12345);
INSERT INTO `cart` VALUES (2613837);
INSERT INTO `cart` VALUES (5951623);

/* data for Table customer */
INSERT INTO `customer` VALUES ("asdasdasd",0);
INSERT INTO `customer` VALUES ("atilla",0);
INSERT INTO `customer` VALUES ("baris",0);
INSERT INTO `customer` VALUES ("bariss",0);
INSERT INTO `customer` VALUES ("kaan",0);
INSERT INTO `customer` VALUES ("kaan2",0);
INSERT INTO `customer` VALUES ("kaan3",0);
INSERT INTO `customer` VALUES ("yaprakraprkarapkrapk",0);

/* data for Table district */
INSERT INTO `district` VALUES ("Bati");
INSERT INTO `district` VALUES ("Koc");

/* data for Table menu */
INSERT INTO `menu` VALUES (1);
INSERT INTO `menu` VALUES (2);

/* data for Table menu_item */
INSERT INTO `menu_item` VALUES (12,1,"Kebap","5.00","1",10);
INSERT INTO `menu_item` VALUES (20,2,"Doner","4.00","1",20);

/* data for Table mi_rev */

/* data for Table order */

/* data for Table owner */
INSERT INTO `owner` VALUES ("maya");
INSERT INTO `owner` VALUES ("mayaa");

/* data for Table pro_mi */
INSERT INTO `pro_mi` VALUES (12,321);

/* data for Table promotion */
INSERT INTO `promotion` VALUES (321,"1.00");

/* data for Table rest_dis */
INSERT INTO `rest_dis` VALUES ("Bati","maya","Demo",NULL);
INSERT INTO `rest_dis` VALUES ("Koc","maya","Demo","100");

/* data for Table rest_fav */
INSERT INTO `rest_fav` VALUES ("maya","Demo","kaan");

/* data for Table rest_pro */
INSERT INTO `rest_pro` VALUES ("maya","Demo",321);

/* data for Table rest_rev */

/* data for Table restaurant */
INSERT INTO `restaurant` VALUES ("maya","Demo","08:00:00","20:00:00",12345678,1,NULL);
INSERT INTO `restaurant` VALUES ("maya","Demo2","08:00:00","20:00:00",12345678,2,NULL);

/* data for Table review */

/* data for Table token */
INSERT INTO `token` VALUES ("6YOidOCAeFwQf0ysm2ukZzVZQ84RW9J37ylknYVB","yaprakraprkarapkrapk");
INSERT INTO `token` VALUES ("BToWS9e4m2qmiCUXT5QFgUaDwupOCFbdzzarIow5","kaan3");
INSERT INTO `token` VALUES ("dfYvHxFbdXVDtdfKTJIKHilJAdHVguouKn0rUFD7","bariss");
INSERT INTO `token` VALUES ("DzQHQ5WXKEDEiWJavXmqirlegMohdBZRbQy1WvZG","asdasdasd");
INSERT INTO `token` VALUES ("e6JHvdJMamJOy4aBWOmhaDmJYvknG7WVdFDITmv3","maya");
INSERT INTO `token` VALUES ("Jvtx2pFYRm7BcuRgO6DfVS2lifGUbr1VWusZU8YM","mayaa");
INSERT INTO `token` VALUES ("q9R6bmtBuihys37IH26cU9muCRQnrGfSP6Y1tsCX","atilla");
INSERT INTO `token` VALUES ("Rg7lQlh058LwnKgS9A3zUn6Ruro5P8vHoC3fYlg3","kaan2");
INSERT INTO `token` VALUES ("TfqDshEK4GZJY3urUJ3gxjxFocfiB71vnr8QJMAN","baris");
INSERT INTO `token` VALUES ("xrFEkaczjbAUSOEIuHNJKai0oMaW6rxDScidnvMH","kaan");

/* data for Table user */
INSERT INTO `user` VALUES ("asdasdasd","$2y$10$brqL.ZGRY3UCXjA0Idseqe8qFQ.qfsmxA.Z5aSAfi9GiO.Qc4zjCi","asd","asd",12345,"2",74278);
INSERT INTO `user` VALUES ("atilla","$2y$10$vx3U.VS9yzJmB8G8frXi8eJsqaJQKZWbk.2UtnHBaej6fnogvZEmy","Atilla","GÃ¼rsoy",155,"2",88205);
INSERT INTO `user` VALUES ("baris","$2y$10$x9qp/.VwVxR1RAjAXvWTNu9ZOiQnn1qGhfN8oZ.naVa5krOnkg2dm","Baris","Senkal",123456789,"0",12345678);
INSERT INTO `user` VALUES ("bariss","$2y$10$lG1eLAuITNi.NSIX6xVz5.UcdfefatFk1k/ejo0tCx8GOBrQMPvli","123","1234",123456789,"2",52437);
INSERT INTO `user` VALUES ("kaan","$2y$10$.csjLnEVp4pU2m5JjLhVT.B7aU/E49Kt0ayKvM3hC2ugrHCEUy6iW","Kaan","Kuguoglu",123456789,"2",12345678);
INSERT INTO `user` VALUES ("kaan2","$2y$10$GLf6yp2T.zSdS4Wl7Y/upePChAl96jHkymyUHMhQT7QisWlPjD3kq","1","2",123,"2",47174);
INSERT INTO `user` VALUES ("kaan3","$2y$10$x7jgBojT/MhrBjC4u9NC0ObFrPI.o.e8TSmzMPc7ZFvUVVFQQU9Me","kaan","k",123456789,"2",43483);
INSERT INTO `user` VALUES ("maya","$2y$10$7yTIZEvXGzKe./1KGfOmfen2tRhoPon.lThYF8j2B9cQAhXrSl94K","Maya","Younes",123456789,"1",12345678);
INSERT INTO `user` VALUES ("mayaa","$2y$10$Y0mNo3exD0IVZlvhQEMiLuxBKcqVMkog/9dUP8CVxrbo/4yT46U8y","1234","2345",123456789,"1",19822);
INSERT INTO `user` VALUES ("yaprakraprkarapkrapk","$2y$10$sk1ap.Q6CY.wMowCk67NQuZa5UQEdtPd5U1xMb1uyGaU/737va2xC","asdfkas","sadfkasdfk",2147483647,"2",88641);

/* data for Table user_cart */
INSERT INTO `user_cart` VALUES (2613837,"asdasdasd");
INSERT INTO `user_cart` VALUES (5951623,"kaan");

/* Restore session variables to original values */
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
