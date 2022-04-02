var express = require("express");
var router = express.Router();
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET Item page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM item",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("item/list", {
          title: "Items",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var item = {
        id: req.params.id,
      };

      var delete_sql = "delete from item where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          item,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/items");
            } else {
              req.flash("msg_info", "Delete Item Success");
              res.redirect("/items");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM item where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/items");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Item can't be find!");
              res.redirect("/items");
            } else {
              console.log(rows);
              res.render("item/edit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("name", "Please fill the name").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_name = req.sanitize("name").escape().trim();
      v_keterangan = req.sanitize("keterangan").escape().trim();
      v_quantity = req.sanitize("quantity").escape();

      var item = {
        name: v_name,
        keterangan: v_keterangan,
        quantity: v_quantity,
      };

      var update_sql = "update item SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          item,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("item/edit", {
                name: req.param("name"),
                keterangan: req.param("keterangan"),
                quantity: req.param("quantity"),
              });
            } else {
              req.flash("msg_info", "Update item success");
              res.redirect("/items/edit/" + req.params.id);
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/items/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("name", "Please fill the name").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_name = req.sanitize("name").escape().trim();
    v_keterangan = req.sanitize("keterangan").escape().trim();
    v_quantity = req.sanitize("quantity").escape();

    var item = {
      name: v_name,
      keterangan: v_keterangan,

      quantity: v_quantity,
    };

    var insert_sql = "INSERT INTO item SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        item,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("item/add-item", {
              name: req.param("name"),
              keterangan: req.param("keterangan"),
              quantity: req.param("quantity"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create item success");
            res.redirect("/items");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("item/add-item", {
      name: req.param("name"),
      keterangan: req.param("keterangan"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("item/add-item", {
    title: "Add New Item",
    name: "",
    quantity: "",
    keterangan: "",
    session_store: req.session,
  });
});

module.exports = router;
