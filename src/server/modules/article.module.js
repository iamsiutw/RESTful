// article.module.js
import mysql from 'mysql';
import config from '../../config/config';
import jwt from 'jsonwebtoken';

const connectionPool = mysql.createPool({
  connectionLimit: 10,
  host: config.mysqlHost,
  user: config.mysqlUserName,
  password: config.mysqlPass,
  database: config.mysqlDatabase
});

/* Article  POST 新增 */
const createArticle = (insertValues) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query('insert into article set ?', insertValues, (error, result) => { // Article資料表寫入一筆資料
          if (error) {
            console.error('SQL error: ', error); // 寫入資料庫有問題時回傳錯誤
            reject(error);
          } else if (result.affectedRows === 1) {
            resolve(`新增成功！ article_id: ${result.insertId}`); // 寫入成功回傳寫入id
          }
          connection.release();
        });
      }
    });
  });
};

/*  Article GET 取得  */
const selectArticle = () => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { // 資料庫連線
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else {
        connection.query( // Article撈取所有欄位的值組
          `SELECT * FROM article`
          , (error, result) => {
            if (error) {
              console.error('SQL error: ', error);
              reject(error); // 寫入資料庫有問題時回傳錯誤
            } else {
              resolve(result); // 撈取成功回傳 JSON 資料
            }
            connection.release();
          }
        );
      }
    });
  });
};

/* Article PUT 修改 */
const modifyArticle = (insertValues, articleId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { //連線資料庫
      if (connectionError) {
        reject(connectionError); // 若連線有問題回傳錯誤
      } else { // Article資料表修改指定id一筆資料
        connection.query('update article set ? where article_id = ?', [insertValues, articleId], (error, result) => {
          if (error) {
            console.error('SQL error: ', error); // 寫入資料庫有問題時回傳錯誤
            reject(error);
          } else if (result.affectedRows === 0) { // 寫入時發現無該筆資料
            resolve('請確認修改id');
          } else if (result.message.match('Changed: 1')) { // 寫入成功
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

/* Article DELETE 刪除 */
const deleteArticle = (articleId) => {
  return new Promise((resolve, reject) => {
    connectionPool.getConnection((connectionError, connection) => { //資料庫連線
      if (connectionError) {
        reject(connectionError); //若連線有問題回傳錯誤
      } else { // Article資料表刪除指定一筆資料
        connection.query('delete from article where article_id = ? ', articleId, (error, result) => {
          if (error) {
            console.error('SQL error: ', error);// 資料庫存取有問題的回傳錯誤
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

/* Article GET JWT 取得個人文章 */
const selectPersonalArticle = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, 'my_secret_key', (err, decoded) => {
      if (err) {
        reject(err); // 驗證失敗回傳錯誤
      } else {
        // JWT 驗證成功 -> 取得用戶user_id
        const userId = decoded.payload.user_id;
        //JWT 驗證成功 -> 取得該user_id的所有文章
        connectionPool.getConnection((connectionError, connection) => {
          if (connectionError) {
            reject(connectionError);
          } else {
            connection.query('select * from article where user_id = ?', [userId], (error, result) => {
              if (error) {
                reject(error); //有問題回傳錯誤
              } else {
                resolve(result); //成功回傳json資料
              }
              connection.release();
            });
          }
        });
      }
    });
  });
};

export default {
  createArticle,
  selectArticle,
  modifyArticle,
  deleteArticle,
  selectPersonalArticle
};
