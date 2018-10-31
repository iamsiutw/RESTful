// user.module.js
import mysql from 'mysql';
import config from '../../config/config';
import bcrypt from 'bcrypt';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});

/* User POST 新增 */
const createUser = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { //連線資料庫
      if (connectionError) {
        reject(connectionError); // 連線有問題回傳錯誤
      } else {
        connection.query('insert into user set ?', insertValues, (error, result) => {
          if (error) { // User資料表寫入一筆資料
            console.error('SQL error: ', error);
            reject(error); //寫入資料庫有問題時回傳錯誤
          } else if (result.affectedRows === 1) {
            resolve(`新增成功！ user_id: ${result.insertId}`); //寫入成功回傳寫入id
          }
          connection.release();
        });
      }
    });
  });
};

/** User Get 取得 */
const selectUser = () => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError);
      } else {
        connection.query('select * from user', (error, result) => {
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else {
            resolve(result); // 成功回傳json資料
          }
          connection.release();
        });
      }
    });
  })
};

/** User PUT 修改 */
const modifyUser = (insertValues, userId) => { 
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { //資料庫連線
      if (connectionError) {
        reject(connectionError); //連線有問題回傳錯誤
      } else { //User資料表修改指定id資料
        connection.query('update user set ? where user_id = ?', [insertValues, userId], (error, result) => {
          if (error) {
            console.error('SQL error: ', error); //寫入資料庫有問題時回傳錯誤
            reject(error);
          } else if (result.affectedRows === 0){ //寫入時發現無資料
            resolve('請確認修改id');
          } else if (result.message.match('Changed: 1')) { //寫入成功
            resolve('資料修改成功');
          } else {
            resolve('資料無異動');
          }
          connection.release();
        });
      }
    });
  });
};

/** User DELETE 刪除 */
const deleteUser = (userId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { //資料庫連線
      if (connectionError) {
        reject(connectionError); // 連線有問題回傳錯誤
      } else {
        connection.query('delete from user where user_id = ?', userId, (error, result) => {
          if (error) {
            console.error('SQL error: ', error); //刪除有問題時回傳錯誤
            reject(error);
          } else if (result.affectedRows === 1) {
            resolve('刪除成功');
          } else {
            resolve('刪除失敗');
          }
          connection.release();
        });
      }
    });
  });
};

/** User GET (Login) 取得登入資訊*/
const selectUserLogin = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => {
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query('select * from user where user_mail = ?', insertValues.user_mail, (error, result) => { // User撈取mail欄位的值組
          if (error) {
            console.error('SQL error: ', error);
            reject(error); // 寫入資料庫有問題時回傳錯誤
          } else if (Object.keys(result).length === 0) {
            resolve('信箱尚未註冊');
          } else {
            const dbHashPassword = result[0].user_password; // 資料庫加密後的密碼
            const userPassword = insertValues.user_password; // 使用者登入輸入的密碼
            bcrypt.compare(userPassword, dbHashPassword).then((res) => {
              if (res) {
                resolve('登入成功');
              } else {
                resolve('您輸入的密碼有誤');
              }
            });
          }
          connection.release();
          }
        );
      }
    });
  });
};

export default {
  createUser,
  selectUser,
  modifyUser,
  deleteUser,
  selectUserLogin
}