<?php

date_default_timezone_set('Europe/Istanbul');

/*

restaurant name and user name should be alphanumeric only.

TODO DB

add status for order.

*/

$con=mysqli_connect("localhost","Group_6","vzndq","Group_6_db");

// Check connection
if (mysqli_connect_errno())
{
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}


//Source: http://stackoverflow.com/a/4356295
function generateRandomString($length = 40) {
  $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  $charactersLength = strlen($characters);
  $randomString = '';
  for ($i = 0; $i < $length; $i++) {
    $randomString .= $characters[rand(0, $charactersLength - 1)];
  }
  return $randomString;
}

class ErrorMessage {
  public $message = 'Unknown Error';
  public $errcode = 0;
}

class SearchResult {
  public $restaurants;
  public $menu_items;
}

class MixedMenuResult {
  public $promotions;
  public $menu_items;
}

//Dirty fix for AngularJS POST.
foreach(json_decode(file_get_contents("php://input")) as $key => $value){
  $_REQUEST[$key] = $value;
}


//Enabling access to server from all websites. (It is secured by School VPN anyways.)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST,GET,OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

$user = '';
$isAuth = 0;

if($_REQUEST["token"]){

  $result = mysqli_query($con,"select username from token where token='".$_REQUEST['token']."'");

  if(mysqli_num_rows($result) == 1){
    $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
    $isAuth = 1;
    $user = $row['username'];
  }
}


if($_REQUEST['type'] == 1){

  if($_REQUEST['job'] == 1){ //Restaurant + Food Search

    //TODO check "keywords"

    $result = new SearchResult();

    $keywords = explode(" ",$_REQUEST["keywords"]);
    $numofkeywords = count($keywords);

    //TODO check number of keywords.

    $likestr = "";

    //Restaurants

    for ($x = 0; $x < $numofkeywords-1; $x++) {
      $likestr .= "name LIKE '%".$keywords[$x]."%' OR ";
    }
    $likestr .= "name LIKE '%".$keywords[$numofkeywords-1]."%'";

    if($isAuth){

      //NOTE: rest_ow needed as restaurants don't have unique IDs, they are identified by their name and owner.
      $return = mysqli_query($con,"select name, restaurant.rest_ow, avg_minutes from restaurant left join rest_dis on (restaurant.name = rest_dis.rest_name and restaurant.rest_ow = rest_dis.rest_ow) where isNULL(district) or district = (select address.add_d from user, address where user.username='".$user."' and address.ID = user.user_add) and (".$likestr.") ORDER BY rest_dis.avg_minutes IS NULL ASC, rest_dis.avg_minutes ASC");

    } else {

      //User is not logged in.

      $return = mysqli_query($con,"select name, rest_ow from restaurant where (".$likestr.")");

    }

    $x = 0;
    while($row = mysqli_fetch_array($return,MYSQLI_ASSOC)){
      $result->restaurants[$x] = $row;
      $x += 1;
    }


    //Menu Items

    $likestr = "";

    for ($x = 0; $x < $numofkeywords-1; $x++) {
      $likestr .= "mi.name LIKE '%".$keywords[$x]."%' OR ";
    }
    $likestr .= "mi.name LIKE '%".$keywords[$numofkeywords-1]."%'";

    if($isAuth){

      $return = mysqli_query($con,"select mi.ID, mi.name, mi.price, mi.type, r.name as rest_name, r.rest_ow, r.avg_minutes from menu_item as mi, menu as m, (select restaurant.rest_ow, restaurant.name, restaurant.work_hour_start, restaurant.work_hour_end, restaurant.rest_add, restaurant.rest_menu, rest_dis.district, avg_minutes from restaurant left join rest_dis on (restaurant.name = rest_dis.rest_name and restaurant.rest_ow = rest_dis.rest_ow) where isNULL(district) or district = (select address.add_d from user, address where user.username='".$user."' and address.ID = user.user_add) ORDER BY rest_dis.avg_minutes IS NULL ASC, rest_dis.avg_minutes ASC) as r where mi.menu = m.ID and r.rest_menu = m.ID and (".$likestr.")");

    } else {
      $return = mysqli_query($con,"select mi.ID, mi.name, mi.price, mi.type, r.name as rest_name, r.rest_ow from menu_item as mi, menu as m, restaurant as r where mi.menu = m.ID and r.rest_menu = m.ID and (".$likestr.")");
    }

    //TODO show only the ones avaliable in the district
    //TODO order by delivery time (OF the food's restaurant).

    $x = 0;
    while($row = mysqli_fetch_array($return,MYSQLI_ASSOC)){
      $result->menu_items[$x] = $row;
      $x += 1;
    }

    //TODO? promotion search: "select pmi.promotion, p.cost, mi.name, mi.type from promotion as p, pro_mi as pmi, menu_item as mi where p.ID = pmi.promotion and mi.ID = pmi.item", need to search in restaurant name + menu item name. And order by restaurant region times.

    echo json_encode($result);

  } else if($_REQUEST['job'] == 2){
    //Get list of districts
    $result = mysqli_query($con,"select name from district");

    $return = array();

    $x = 0;
    while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
      $return[$x++] = $row['name'];
    }

    echo json_encode($return);

  } else if($_REQUEST['job'] == 3){
    //Getting user information for editing.
    if($isAuth){

      $result = mysqli_query($con,"select name, surname, phone, user_add, door, street, city, add_d from user, address where user.user_add = address.ID and username='".$user."'");

      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

      echo json_encode($row);

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to be logged in to access your full account information.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 4){ //Get cart

    if($isAuth){

      $result = mysqli_query($con,"select * from user_cart where user='".$user."'");

      if(mysqli_num_rows($result) <= 0){

        $cartID = rand ( 1000000 , 9999999 );

        $result = mysqli_query($con,"INSERT INTO `cart` SET `ID`='".$cartID."'");
        $result = mysqli_query($con,"INSERT INTO `user_cart` SET `cart`='".$cartID."',`user`='".$user."'");

        echo '{"promotions":[],"menu_items":[]}';

      } else {
        $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
        $cartID = $row["cart"];

        $return = new MixedMenuResult();
        $return->menu_items = array();
        $return->promotions = array();


        $result = mysqli_query($con,"select ID,quantity,name,price,type from c_mi, menu_item where c_mi.item = menu_item.ID and c_mi.cart='".$cartID."'");

        $x = 0;
        while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
          $return->menu_items[$x++] = $row;
        }

        $result = mysqli_query($con,"select pro.promotion,cost,name,type,c_pro.quantity from c_pro, (select cost, name, type, pro_mi.promotion as promotion from promotion, pro_mi, menu_item where promotion.ID = pro_mi.promotion and pro_mi.item = menu_item.ID) as pro where c_pro.promotion = pro.promotion and c_pro.cart='".$cartID."'");

        $x = 0;
        while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
          $return->promotions[$x++] = $row;
        }

        echo json_encode($return);

      }

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to be logged in to access your full account information.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 5){ //Get rest menu + fav or not + most ordered item +  working hours.

    $return = array();

    $return["menu"] = new MixedMenuResult();
    $return["menu"]->menu_items = array();
    $return["menu"]->promotions = array();

    $result = mysqli_query($con,"select ID,mi.name,price,type,mi.ordercount from restaurant as r, menu_item as mi where r.rest_ow = '".$_REQUEST['owner']."' and r.name ='".$_REQUEST['name']."' and r.rest_menu = mi.menu");

    $x = 0;
    while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
      $return["menu"]->menu_items[$x++] = $row;
    }

    $result = mysqli_query($con,"select cost, name, type, pro.promotion from rest_pro, (select cost, name, type, pro_mi.promotion as promotion from promotion, pro_mi, menu_item where promotion.ID = pro_mi.promotion and pro_mi.item = menu_item.ID) as pro where pro.promotion = rest_pro.promotion and rest_pro.rest_ow = '".$_REQUEST['owner']."' and rest_pro.rest_name = '".$_REQUEST['name']."'");

    $x = 0;
    while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
      $return["menu"]->promotions[$x++] = $row;
    }

    if($isAuth){
      $result = mysqli_query($con,"select EXISTS(select 1 from rest_fav where user='".$user."' and rest_ow='".$_REQUEST['owner']."' and rest_name='".$_REQUEST['name']."') as e");
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
      if($row["e"] == 1){
        $return["fav"]="true";
      } else {
        $return["fav"]="false";
      }
    } else {
      $return["fav"]="false";
    }

    $result = mysqli_query($con,"select work_hour_start,work_hour_end from restaurant where rest_ow='".$_REQUEST['owner']."' and name='".$_REQUEST['name']."'");
    $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

    $return["work_hour_start"] = $row["work_hour_start"];
    $return["work_hour_end"] = $row["work_hour_end"];

    echo json_encode($return);

  } else if($_REQUEST['job'] == 6){ //Add remove rest from favs.

    //TODO

  } else if($_REQUEST['job'] == 7){//Recent Orders

    if($isAuth){

      $result = mysqli_query($con,"select ID,user,date,o.rest_ow,o.rest_name,status, not isNULL(r.review) as has_rev from `order` as o left join rest_rev as r on o.ID = r.orderID where user='".$user."'");

      $return = array();

      $x = 0;
      while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
        $return[$x++] = $row;
      }

      echo json_encode($return);

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to be logged in to see your previous orders.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 8){ //Get order's info

    if($isAuth){

      $return = array();
      $return["menu_items"] = array();
      $return["promotions"] = array();

      $result = mysqli_query($con,"select user,date,rest_ow,rest_name,status from `order` where ID=".$_REQUEST['order']);
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

      foreach ($row as $key => $value) {
        $return[$key] = $value;
      }

      $result = mysqli_query($con,"select menu_item.ID,quantity,name,price,type from c_mi, menu_item, `order` where c_mi.item = menu_item.ID and `order`.cart = c_mi.cart and `order`.ID=".$_REQUEST['order']);

      $x = 0;
      while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
        $return["menu_items"][$x++] = $row;
      }

      $result = mysqli_query($con,"select pro.promotion,cost,name,type,c_pro.quantity from c_pro, (select cost, name, type, pro_mi.promotion as promotion from promotion, pro_mi, menu_item where promotion.ID = pro_mi.promotion and pro_mi.item = menu_item.ID) as pro, `order` where c_pro.promotion = pro.promotion and c_pro.cart = `order`.cart and `order`.ID=".$_REQUEST['order']);

      $x = 0;
      while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
        $return["promotions"][$x++] = $row;
      }

      echo json_encode($return);

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to be logged in to see your previous orders.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 9){//restaurants a person owns

    if($isAuth){

      $return = array();

      $result = mysqli_query($con,"select * from restaurant where rest_ow='".$user."'");

      $x = 0;
      while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
        $return[$x++] = $row['name'];
      }

      echo json_encode($return);

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to be logged in to see your previous orders.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 10){//Get Orders

    if($isAuth){

      if(strlen($_REQUEST["name"]) > 0){
        $result = mysqli_query($con,"select * from `order` where rest_ow='".$user."' and rest_name='".$_REQUEST["name"]."' and status=".$_REQUEST["status"]);
      } else {
        $result = mysqli_query($con,"select * from `order` where rest_ow='".$user."' and status=".$_REQUEST["status"]);
      }

      $return = array();

      $x = 0;
      while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
        $return[$x++] = $row;
      }

      echo json_encode($return);

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to be the owner to see restaurant\'s orders';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 11){//Finish a order.

    if($isAuth){

      $result = mysqli_query($con,"UPDATE `order` SET status=1 where rest_ow='".$user."' and ID=".$_REQUEST["ID"]);

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to be the owner of the restaurant to finish a order';
      echo json_encode($obj);
    }

  }


} else if($_REQUEST['type'] == 2) {
  //Type 2 is login and logout.

  //TODO check for username and password to ne nonempty.

  if($_REQUEST['job'] == 1){ //Register

    if(strlen($_REQUEST['username']) > 3){

      $result = mysqli_query($con,"SELECT username FROM user WHERE username='".$_REQUEST['username']."'");

      if(mysqli_num_rows($result) > 0){
        http_response_code(404);
        $obj = new ErrorMessage();
        $obj->message = 'Username exitsts.';
        echo json_encode($obj);
      } else {

        //TODO check name, surname, phone

        //TODO check address's district??
        //TODO check door,street,city

        $addressid = rand ( 10000 , 99999 );

        $result = mysqli_query($con,"INSERT INTO address SET ID='".$addressid."',door='".$_REQUEST["door"]."',street='".$_REQUEST["street"]."',city='".$_REQUEST["city"]."',add_d='".$_REQUEST["add_d"]."'");

        if(mysqli_affected_rows($con) == 1){

          $hashToStoreInDb = password_hash($_REQUEST['password'], PASSWORD_BCRYPT);

          $result = mysqli_query($con,"INSERT INTO user SET username='".$_REQUEST["username"]."',hash='".$hashToStoreInDb."',name='".$_REQUEST["name"]."',surname='".$_REQUEST["surname"]."',phone='".$_REQUEST["phone"]."',type='".$_REQUEST["usertype"]."',user_add='".$addressid."'");

          if(mysqli_connect_errno()){
            http_response_code(404);
            $obj = new ErrorMessage();
            $obj->message = mysqli_error($con);
            echo json_encode($obj);
          } else {
            if($_REQUEST["usertype"]  == 1){
              $result = mysqli_query($con,"INSERT INTO `owner` SET `user`='".$_REQUEST["username"]."'");
            } else if($_REQUEST["usertype"]  == 2) {
              $result = mysqli_query($con,"INSERT INTO `customer` SET `user`='".$_REQUEST["username"]."',`points`='0'");
            }

            if(mysqli_connect_errno()){
              http_response_code(404);
              $obj = new ErrorMessage();
              $obj->message = mysqli_error($con);
              echo json_encode($obj);
            } else {
              $token = generateRandomString();

              $result = mysqli_query($con, "INSERT INTO `token` SET `token`='".$token."',`username`='".$_REQUEST['username']."' ON DUPLICATE KEY UPDATE `token`='".$token."'");


              $return = array();

              $return["name"] = $_REQUEST["name"];
              $return["surname"] = $_REQUEST["surname"];
              $return["token"] = $token;
              $return["type"] = $_REQUEST["type"];
              $return["username"] = $_REQUEST["username"];

              //TODO add owner/customer only info as well.

              echo json_encode($return);
            }
          }

        } else {
          http_response_code(404);
          $obj = new ErrorMessage();
          $obj->message = 'Check values for the address and try again.';
          echo json_encode($obj);
        }

      }

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'Username Too Short';
      echo json_encode($obj);
    }


  } else if($_REQUEST['job'] == 3) { //Token Check

    $result = mysqli_query($con,"SELECT username FROM token WHERE token='".$_REQUEST['token']."'");

    if(mysqli_num_rows($result) > 0){
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

      //Getting only required parts.
      $result = mysqli_query($con,"select username, name, surname, type from user where username='".$row["username"]."'");

      if(mysqli_num_rows($result) > 0){
        $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

        $row['token'] = $_REQUEST['token'];

        echo json_encode($row);

      } else {
        http_response_code(404);
      }

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'Expired Token';
      echo json_encode($obj);
    }


  } else if($_REQUEST['job'] == 0){

    $result = mysqli_query($con,"SELECT hash FROM user WHERE username='".$_REQUEST['username']."'");

    if(mysqli_num_rows($result) > 0){
      $row = mysqli_fetch_array($result);

      $isPasswordCorrect = password_verify($_REQUEST['password'], $row['hash']);

      $token = generateRandomString();

      if($isPasswordCorrect){

        $result = mysqli_query($con, "INSERT INTO `token` SET `token`='".$token."',`username`='".$_REQUEST['username']."' ON DUPLICATE KEY UPDATE `token`='".$token."'");

        //Getting only required parts.
        $result = mysqli_query($con,"select username, name, surname, type from user where username='".$_REQUEST['username']."'");

        if(mysqli_num_rows($result) > 0){
          $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

          $row["token"] = $token;

          //TODO add owner/customer only info as well.

          echo json_encode($row);
        }

      } else {
        http_response_code(404);
        $obj = new ErrorMessage();
        $obj->message = 'Wrong Password.';
        echo json_encode($obj);
      }

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'User does not exist.';
      echo json_encode($obj);
    }

  }

} else if($_REQUEST['type'] == 3) {
  //  TODO:
  //
  //for job 1 use: "select EXISTS(select 1 from restaurant where restaurant.rest_ow = '".$user."' and restaurant.rest_menu = '".$_REQUEST["menu"]."') as e"
  //
  //for job 5 use: "select EXISTS(select * from restaurant,menu_item where restaurant.rest_ow = '".$user."' and restaurant.rest_menu = menu_item.menu and menu_item.ID = '".$_REQUEST["item"]."') as e"
  //
  //after mysqli_fetch_array, you can check if($row["e"] == 1) ...
  //
  //in else parts for these checks, you can use;
  //  http_response_code(404);
  //  $obj = new ErrorMessage();
  //  $obj->message = 'You can only change a restaurant you own.';
  //  echo json_encode($obj);


  //TODO Add to all jobs: check for if $user can do these changes.


  if($_REQUEST['job'] == 0){ // Open a restaurant in the system


    $result = mysqli_query($con,"SELECT type FROM user WHERE username='".$user."'");
    $row = mysqli_fetch_array($result);

    $userType = $row["type"];

    if(($isAuth == 1)&&($userType==1)){

      //TODO add payment (Baris added payment field)

      $addressid = rand ( 10000 , 99999 );
      $menuid = rand ( 10000 , 99999 );

      $result = mysqli_query($con,"INSERT INTO address SET ID='".$addressid."', door='".$_REQUEST["door"]."', street='".$_REQUEST["street"]."', city='".$_REQUEST["city"]."', add_d='".$_REQUEST["add_d"]."'");

      $result = mysqli_query($con,"INSERT INTO `menu` SET `ID`='".$menuid."'");

      $result = mysqli_query($con,"INSERT INTO restaurant VALUES ('".$user."','"
      .$_REQUEST['name']."','"
      .$_REQUEST['work_hour_start']."','"
      .$_REQUEST['work_hour_end']."', ".$addressid." ,".$menuid.", ".$_REQUEST['payment'].") ON DUPLICATE KEY UPDATE work_hour_start='"
      .$_REQUEST['work_hour_start']."', work_hour_end='"
      .$_REQUEST['work_hour_end']."', payment='".$_REQUEST['payment']."'");


    }
  } else if($_REQUEST['job'] == 1){ //Add items to the menu of a restaurant they own

    $result = mysqli_query($con,"select rest_menu from restaurant where restaurant.rest_ow = '".$user."' and restaurant.name = '".$_REQUEST["rest_name"]."'");
    $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

    if(strlen($row["rest_menu"]) > 0 && $isAuth){

      $mi_ID = rand ( 100000 , 999999 );

      $result_menuItem = mysqli_query($con,"INSERT INTO menu_item VALUES (".$mi_ID.","
      .$row['menu'].",'"
      .$_REQUEST['name']."',"
      .$_REQUEST['price'].","
      .$_REQUEST['item_type'].",0) ON DUPLICATE KEY UPDATE name='".$_REQUEST['name']."', price=".$_REQUEST['price'].", type=".$_REQUEST['type']);

    }else{
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You can only change a menu of a restaurant you own.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 2){ //Close a restaurant they own

    if($isAuth){

      $result = mysqli_query($con,"select EXISTS(select 1 from `order` where rest_ow='".$user."' and rest_name='".$_REQUEST['name']."' and status=0) as e");
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

      if($row["e"] != 1){
        $result_getMenu = mysqli_query($con,"select rest_menu from restaurant where rest_ow='".$user."' and name='".$_REQUEST['name']."'");
        $row = mysqli_fetch_array($result_getMenu,MYSQLI_ASSOC);
        $menu = $row["rest_menu"];

        $result = mysqli_query($con,"DELETE FROM restaurant WHERE rest_ow='".$user."' and name='".$_REQUEST['name']."'");

        $result = mysqli_query($con,"DELETE FROM menu WHERE ID=".$menu);
      } else {
        http_response_code(404);
        $obj = new ErrorMessage();
        $obj->message = 'Unfinished orders exist, can not close restaurant.';
        echo json_encode($obj);
      }

    }else{
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You can only close a restaurant you own.';
      echo json_encode($obj);
    }
  } else if($_REQUEST['job'] == 4){ //Create promotions consisting of a set of menu item.

    if($isAuth){

      $proID = rand ( 100000 , 999999 );

      $result = mysqli_query($con,"INSERT INTO promotion VALUES (".$proID.","
      .$_REQUEST['cost'].") ON DUPLICATE KEY UPDATE cost=".$_REQUEST['cost']);

      $result = mysqli_query($con,"INSERT INTO rest_pro SET rest_ow='".$user."',rest_name='".$_REQUEST["rest_name"]."',promotion=".$proID);

    }else{
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You can only open a promotion for a restaurant you own.';
      echo json_encode($obj);
    }
  } else if($_REQUEST['job'] == 5){ //Add item to promotion.

    if($isAuth){
      $result = mysqli_query($con,"select EXISTS(select 1 from menu_item, rest_pro, restaurant where menu_item.menu = restaurant.rest_menu and rest_pro.rest_ow = restaurant.rest_ow and restaurant.name = rest_pro.rest_name and menu_item.ID=".$_REQUEST["item"]." and rest_pro.promotion=".$_REQUEST["promotion"]." and restaurant.rest_ow='".$user."') as e");

      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

      if($row["e"] == 1){

        $result = mysqli_query($con,"INSERT INTO pro_mi VALUES (".$_REQUEST['item'].",".$_REQUEST['promotion'].")");

      }else{
        http_response_code(404);
        $obj = new ErrorMessage();
        $obj->message = 'You can only add items to promotion from the menu of a restaurant you own.';
        echo json_encode($obj);
      }
    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You can only add a promotion of a restaurant you own.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 6){ //Get districts of restaurant

    $result = mysqli_query($con,"select district,avg_minutes from rest_dis where rest_ow='".$_REQUEST['owner']."' and rest_name='".$_REQUEST['name']."'");

    $return = array();

    $x = 0;
    while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
      $return[$x]->name = $row["district"];
      $return[$x++]->avg_minutes = $row["avg_minutes"];
    }

    echo json_encode($return);


  } else if($_REQUEST['job'] == 7){ //Add/remove district to restaurant

    if($isAuth){

      if($_REQUEST['avg_minutes'] == 0){

        $result = mysqli_query($con,"DELETE FROM rest_dis WHERE district='".$_REQUEST['district']."' and rest_ow='".$user."' and rest_name='".$_REQUEST['name']."'");

      } else {
        $result = mysqli_query($con,"INSERT INTO rest_dis SET district='".$_REQUEST['district']."', rest_ow='".$user."', rest_name='".$_REQUEST['name']."', avg_minutes=".$_REQUEST['avg_minutes']." ON DUPLICATE KEY UPDATE avg_minutes=".$_REQUEST['avg_minutes']);
      }

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You can only districts of a restaurant you own.';
      echo json_encode($obj);
    }

  }

} else if($_REQUEST['type'] == 4) {


  if($_REQUEST['job'] == 0){ // user edit/update

    $result = mysqli_query($con, "UPDATE user SET name='".$_REQUEST['name']."' , surname='".$_REQUEST['surname']."', phone='".$_REQUEST['phone']."' WHERE username='".$user."'");

  } else if($_REQUEST['job'] == 1){ //address edit/update


    $result = mysqli_query($con, "UPDATE address SET door='".$_REQUEST['door']."' , street='".$_REQUEST['street']."', city='".$_REQUEST['city']."', add_d='".$_REQUEST['add_d']."' WHERE ID='".$_REQUEST['ID']."'");

  } else if($_REQUEST['job'] == 2){ //add item

    if($isAuth){

      $result = mysqli_query($con,"select * from user_cart where user='".$user."'");
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
      $cartID = $row["cart"];

      $result = mysqli_query($con, "INSERT INTO `c_mi` SET `item`='".$_REQUEST['item']."',`cart`='".$cartID."' ,`quantity`='".$_REQUEST['quantity']."' ON DUPLICATE KEY UPDATE `quantity`='".$_REQUEST['quantity']."'");

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to log in to add items to your cart.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 3){ //add promotion

    if($isAuth){

      $result = mysqli_query($con,"select * from user_cart where user='".$user."'");
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
      $cartID = $row["cart"];

      $result = mysqli_query($con, "INSERT INTO `c_pro` SET `cart`='".$cartID."',`promotion`='".$_REQUEST['promotion']."' ,`quantity`='".$_REQUEST['quantity']."' ON DUPLICATE KEY UPDATE `quantity`='".$_REQUEST['quantity']."'");

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to log in to add items to your cart.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 4){ // empty cart

    if($isAuth){

      $result = mysqli_query($con,"select * from user_cart where user='".$user."'");
      $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
      $cartID = $row["cart"];

      $result_delRest = mysqli_query($con,"DELETE FROM cart WHERE ID=".$cartID);

      //Getting new card for the user.
      $newCartID = rand ( 1000000 , 9999999 );
      $result = mysqli_query($con,"INSERT INTO `cart` SET `ID`='".$newCartID."'");
      $result = mysqli_query($con,"UPDATE user_cart SET cart='".$newCartID."' WHERE user='".$user."'");

    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to log in to empty your cart.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 5){ // place order

    if($isAuth){

      // $time = time() - 2040; //Fixing server's time.
      //
      // if($time > ($_REQUEST['date'] + 120)){ //2 minutes max delay
      //   http_response_code(404);
      //   $obj = new ErrorMessage();
      //   $obj->message = 'Cannot place order for a past time';
      //   echo json_encode($obj);
      // } else if(($_REQUEST['date'] - $time) > 172920) { //2 minutes max delay
      //   http_response_code(404);
      //   $obj = new ErrorMessage();
      //   $obj->message = 'Cannot place order more then next 48 hours into future';
      //   echo json_encode($obj);
      // } else {

        $result = mysqli_query($con,"select * from user_cart where user='".$user."'");
        $row = mysqli_fetch_array($result,MYSQLI_ASSOC);
        $cartID = $row["cart"];

        $menus = array();

        $result = mysqli_query($con,"select menu from c_mi, menu_item where c_mi.item = menu_item.ID and c_mi.cart=".$cartID);
        while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
          $menus[$row["menu"]] = 1;
        }
        $result = mysqli_query($con,"select menu from c_pro, promotion, pro_mi, menu_item where c_pro.promotion = promotion.ID and promotion.ID = pro_mi.promotion and pro_mi.item = menu_item.ID and c_pro.cart=".$cartID);
        while($row = mysqli_fetch_array($result,MYSQLI_ASSOC)){
          $menus[$row["menu"]] = 1;
        }

        if(count($menus) == 0){
          http_response_code(404);
          $obj = new ErrorMessage();
          $obj->message = 'Cart is empty.';
          echo json_encode($obj);
        } else if(count($menus) == 1){
          $orderID = rand ( 1000000 , 9999999 );

          //Getting the menu of the items
          current($menus);
          $menu = key($menus);

          $result = mysqli_query($con,"select * from restaurant where rest_menu=".$menu); //rest_ow,name
          $row = mysqli_fetch_array($result,MYSQLI_ASSOC);

          $result = mysqli_query($con,"INSERT INTO `order` SET ID=".$orderID.",cart=".$cartID.",user='".$user."',date='".date('D M d Y H:i:s O',$_REQUEST['date'])."',rest_ow='".$row["rest_ow"]."',rest_name='".$row["name"]."',status=0");

          //Getting new card for the user.
          $newCartID = rand ( 1000000 , 9999999 );
          $result = mysqli_query($con,"INSERT INTO `cart` SET `ID`='".$newCartID."'");
          $result = mysqli_query($con,"UPDATE user_cart SET cart='".$newCartID."' WHERE user='".$user."'");

          //Updating ordercount
          $result = mysqli_query($con,"UPDATE menu_item SET ordercount = ordercount + 1 WHERE ID in(select mi.ID from c_mi, (select * from menu_item) as mi where c_mi.item = mi.ID and c_mi.cart=".$cartID.") or ID in(select mi.ID from c_pro, promotion, pro_mi, (select * from menu_item) as mi where c_pro.promotion = promotion.ID and promotion.ID = pro_mi.promotion and pro_mi.item = mi.ID and c_pro.cart=".$cartID.")");

        } else {
          http_response_code(404);
          $obj = new ErrorMessage();
          $obj->message = 'Cart includes items from multiple restaurants.';
          echo json_encode($obj);
        }


    } else {
      http_response_code(404);
      $obj = new ErrorMessage();
      $obj->message = 'You need to log in to add items to your cart.';
      echo json_encode($obj);
    }

  } else if($_REQUEST['job'] == 6){ //menu item review

  } else if($_REQUEST['job'] == 7){ //order (rest) review

    $revID = rand ( 1000000 , 9999999 );
    $result = mysqli_query($con,"INSERT INTO `review` SET ID='".$revID."',rank='".$_REQUEST["rank"]."',comment='".$_REQUEST["comment"]."'");

    $result = mysqli_query($con,"INSERT INTO `rest_rev` SET review='".$revID."',rest_ow='".$_REQUEST["rest_ow"]."',rest_name='".$_REQUEST["rest_name"]."',orderID='".$_REQUEST["order"]."'");

  }

} else {
  http_response_code(404);
  $obj = new ErrorMessage();
  $obj->message = 'Missing type';
  echo json_encode($obj);
}

mysqli_close($con);
?>
