(function($) {
  var UploadPic = function(element, options) {
    //default setting
    this.formAction = '';
    this.param = {}; //uploadimg接口参数
    this.imgSrc = './image/upload2.png';
    this.imgSize = 5; //上传图片大小限制，单位M
    this.downloadUrl = '';
    this.isAppend = false;
    this.limit = 4;
    this.isLoad = false;
    this.limitSrc = ['./image/upload2.png']; //load图片路径，若仅限一张需传limit:1
    this.needMosaic = true; //load图片是否打码
    this.deleteUrl = '';
    this.hideBtn = false; //是否隐藏删除图片按钮
    this.element = $(element);
    if (typeof options !== 'object' || options === null)
      options = {};
    if (options.param && Object.prototype.toString.call(options.param).substring(8) === "Object]") {
      this.param = options.param
    }
    if (typeof options.hideBtn === "boolean") {
      this.hideBtn = options.hideBtn
    }
    if (typeof options.formAction === "string") {
      this.formAction = options.formAction
    }
    if (typeof options.imgSrc === "string") {
      this.imgSrc = options.imgSrc
    }
    if (typeof options.imgSize === "number") {
      this.imgSize = options.imgSize
    }
    if (typeof options.downloadUrl === "string") {
      this.downloadUrl = options.downloadUrl
    }
    if (typeof options.isAppend === "boolean") {
      this.isAppend = options.isAppend
    }
    if (typeof options.limit === "number") {
      this.limit = options.limit
    }
    if (typeof options.isLoad === "boolean") {
      this.isLoad = options.isLoad
    }
    if (typeof options.needMosaic === "boolean") {
      this.needMosaic = options.needMosaic
    }
    if (Object.prototype.toString.call(options.limitSrc).substring(8) === "Array]") {
      if (options.limitSrc.length > 0 && options.limitSrc.length <= this.limit) {
        this.isAppend = true;
        this.limitSrc = options.limitSrc;
      } else {
        console.log("加载图片的数量不对！")
      }
    }
    if (this.isLoad) {
      for (var i = 0; i < this.limitSrc.length; ++i) {
        this.element.append('<form method="post" action="' + this.formAction +
          '" enctype="multipart/form-data" class="imagebox">' +
          '<input type="file" name="file" value="" accept=".png,.jpg,.jpeg" />' +
          '<img class="img-src" src="' + this.imgSrc + '" alt="" />' +
          '<span class="text-loading"><i class="loading"></i>图片上传中...</span>' +
          '<i class="remove_img"></i>' +
          '</form>')
        var lastform = this.element.children('form').last();
        if (i == 0) {
          lastform.on('click.uploadpic', 'i.remove_img', $.proxy(this.remove, this));
        } else {
          lastform.addClass('more_imgbox');
          lastform.on('click.uploadpic', 'i.remove_img', $.proxy(this.clear, this));
        }
        lastform.on('change.uploadpic', 'input[type="file"]', $.proxy(this.upload, this))
          .on('click.uploadpic', 'span.text-loading', $.proxy(this.refresh, this))
        this.downloadImg(lastform.children('input'), this.limitSrc[i], this.needMosaic);
      }
      if (this.limitSrc.length < this.limit) {
        this.element.append('<form method="post" action="' + this.formAction +
          '" enctype="multipart/form-data" class="imagebox more_imgbox">' +
          '<input type="file" name="file" value="" accept=".png,.jpg,.jpeg" />' +
          '<img class="img-src" src="' + this.imgSrc + '" alt="" />' +
          '<span class="text-loading"><i class="loading"></i>图片上传中...</span>' +
          '<i class="remove_img"></i>' +
          '</form>');
        var uploadform = this.element.children('form').last();
        uploadform.on('change.uploadpic', 'input[type="file"]', $.proxy(this.upload, this))
          .on('click.uploadpic', 'span.text-loading', $.proxy(this.refresh, this))
          .on('click.uploadpic', 'i.remove_img', $.proxy(this.clear, this));
      }
      this.isLoad = false; //正常上传功能
      return;
    }
    this.element.html('<form method="post" action="' + this.formAction +
      '" enctype="multipart/form-data" class="imagebox">' +
      '<input type="file" name="file" value="" accept=".png,.jpg,.jpeg" />' +
      '<img class="img-src" src="' + this.imgSrc + '" alt="" />' +
      '<span class="text-loading"><i class="loading"></i>图片上传中...</span>' +
      '<i class="remove_img"></i>' +
      '</form>');
    //event listener
    this.element.find('form')
      .on('change.uploadpic', 'input[type="file"]', $.proxy(this.upload, this))
      .on('click.uploadpic', 'span.text-loading', $.proxy(this.refresh, this))
    if (this.isAppend) {
      this.element.find('form')
        .on('click.uploadpic', 'i.remove_img', $.proxy(this.clear, this));
    } else {
      this.element.find('form')
        .on('click.uploadpic', 'i.remove_img', $.proxy(this.remove, this));
    }
  }
  UploadPic.prototype = {
    constructor: UploadPic,
    upload: function(e) {
      var that = this;
      if (e.target.value) {
        if (!/\.(jpg|jpeg|png)$/.test(e.target.value.toLowerCase())) {
          alert('不支持上传该格式图片！');
          return;
        }
        if (e.target.files && e.target.files[0].size > this.imgSize * 1024 * 1024) {
          alert('图片大小超过' + this.imgSize + 'M！');
          return;
        }
        $(e.target).next().next('.text-loading').show();
        $(e.target).parent('form').ajaxSubmit({
          type: "post",
          dataType: 'json',
          data: that.param,
          success: function(result) {
            if (result.ReturnCode == 0 && result.Data.FilePath) {
              that.downloadImg($(e.target), result.Data.FilePath, false);
            } else {
              $(e.target).next().next('.text-loading').text('上传失败，请稍后重试');
              $(e.target).val('');
            }
          },
          error: function() {
            alert('当前系统繁忙，请稍后重试。');
            $(e.target).next().next('.text-loading').hide();
            $(e.target).val('');
          }
        })
      }
    },
    downloadImg: function(e, filepath, needMosaic) {
      var that = this;
      //input->e
      if (that.isLoad)
        e.next().next('.text-loading').html('<i></i>图片下载中...');
      else
        e.next().next('.text-loading').html('<i></i>图片上传中...');
      e.next().next('.text-loading').show();
      //图片加载完成
      var img = new Image();
      img.src = that.downloadUrl + '?filePath=' + filepath + '&needMosaic=' + needMosaic;
      img.onload = function() {
        e.attr('data-filepath', filepath);
        e.next('img')[0].src = that.downloadUrl + '?filePath=' + filepath + '&needMosaic=' + needMosaic;
        e.next().next('.text-loading').hide();
        //不可删除图片
        if (!that.hideBtn)
          e.next().next().next('i.remove_img').show();
        e.parent('form').removeClass('is-empty');
        e.next('img').removeAttr('data-src');
        e.next('img').removeAttr('data-needMosaic');
        //上传多张，load自行添加
        var addBox = true;
        that.element.find('img').each(function() {
          if ($(this).attr('src') == that.imgSrc && $(this).next('.text-loading').is(":hidden"))
            addBox = false;
        })
        if (!that.isLoad && that.isAppend && that.element.children('form').length < that.limit && addBox) {
          that.element.append('<form method="post" action="' + that.formAction +
            '" enctype="multipart/form-data" class="imagebox more_imgbox">' +
            '<input type="file" name="file" value="" accept=".png,.jpg,.jpeg" />' +
            '<img class="img-src" src="' + that.imgSrc + '" alt="" />' +
            '<span class="text-loading"><i class="loading"></i>图片上传中...</span>' +
            '<i class="remove_img"></i>' +
            '</form>');
          var lastform = that.element.children('form').last();
          lastform.on('change.uploadpic', 'input[type="file"]', $.proxy(UploadPic.prototype.upload.bind(that), that))
            .on('click.uploadpic', 'span.text-loading', $.proxy(UploadPic.prototype.refresh.bind(that), that))
            .on('click.uploadpic', 'i.remove_img', $.proxy(UploadPic.prototype.clear.bind(that), that));
        }
      }
      //兼容ie8
      if (img.complete) {
        e.attr('data-filepath', filepath);
        e.next('img')[0].src = that.downloadUrl + '?filePath=' + filepath + '&needMosaic=' + needMosaic;
        e.next().next('.text-loading').hide();
        if (!that.hideBtn)
          e.next().next().next('i.remove_img').show();
        e.parent('form').removeClass('is-empty');
        e.next('img').removeAttr('data-src');
        e.next('img').removeAttr('data-needMosaic');
        //上传多张，load自行添加
        var addBox = true;
        that.element.find('img').each(function() {
          if ($(this).attr('src') == that.imgSrc && $(this).next('.text-loading').is(":hidden"))
            addBox = false;
        })
        if (!that.isLoad && that.isAppend && that.element.children('form').length < that.limit && addBox) {
          that.element.append('<form method="post" action="' + that.formAction +
            '" enctype="multipart/form-data" class="imagebox more_imgbox">' +
            '<input type="file" name="file" value="" accept=".png,.jpg,.jpeg" />' +
            '<img class="img-src" src="' + that.imgSrc + '" alt="" />' +
            '<span class="text-loading"><i class="loading"></i>图片上传中...</span>' +
            '<i class="remove_img"></i>' +
            '</form>');
          var lastform = that.element.children('form').last();
          lastform.on('change.uploadpic', 'input[type="file"]', $.proxy(UploadPic.prototype.upload.bind(that), that))
            .on('click.uploadpic', 'span.text-loading', $.proxy(UploadPic.prototype.refresh.bind(that), that))
            .on('click.uploadpic', 'i.remove_img', $.proxy(UploadPic.prototype.clear.bind(that), that));
        }
      }
      img.onerror = function() {
        e.next().next('.text-loading').html('加载失败，点击刷新');
        e.next('img').attr('data-src', filepath);
        e.next('img').attr('data-needMosaic', needMosaic);
      }
    },
    refresh: function(e) {
      var that = this;
      if ($(e.target).prev('img').attr('data-src')) {
        that.downloadImg($(e.target).prev().prev('input'), $(e.target).prev('img').attr('data-src'), $(e.target).prev('img').attr('data-needMosaic'))
      } else {
        $(e.target).prev().prev('input').click();
      }
    },
    remove: function(e) {
      var that = this;
      var img = $(e.target).prev().prev('img');
      //删除图片
      if (that.deleteUrl) {
        $.ajax({
          url: that.deleteUrl,
          type: 'post',
          data: {
            filepath: img.prev('input').attr('data-filepath')
          },
          success: function(result) {
            if (result.ReturnCode == 0) {
              img.prev('input').val("");
              img.prev('input').removeAttr('data-filepath');
              img.attr('src', that.imgSrc);
              $(e.target).hide();
            }
          },
          error: function(err) {
            alert('当前系统繁忙，请稍后重试。');
          }
        })
      } else {
        img.prev('input').val("");
        img.prev('input').removeAttr('data-filepath');
        img.attr('src', that.imgSrc);
        $(e.target).hide();
      }
    },
    clear: function(e) {
      var that = this;
      var form = $(e.target).closest('form');
      //删除图片
      if (that.deleteUrl) {
        $.ajax({
          url: that.deleteUrl,
          type: 'post',
          data: {
            filepath: form.find('input').attr('data-filepath')
          },
          success: function(result) {
            if (result.ReturnCode == 0) {
              form.remove();
              if ($(that.element.children('form')[0]).hasClass('more_imgbox')) {
                $(that.element.children('form')[0]).removeClass('more_imgbox')
              }
              var addBox = true;
              that.element.find('img').each(function() {
                if ($(this).attr('src') == that.imgSrc && $(this).next('.text-loading').is(":hidden"))
                  addBox = false;
              })
              if (that.element.children('form').length < that.limit && addBox) {
                that.element.append('<form method="post" action="' + that.formAction +
                  '" enctype="multipart/form-data" class="imagebox more_imgbox">' +
                  '<input type="file" name="file" value="" accept=".png,.jpg,.jpeg" />' +
                  '<img class="img-src" src="' + that.imgSrc + '" alt="" />' +
                  '<span class="text-loading"><i class="loading"></i>图片上传中...</span>' +
                  '<i class="remove_img"></i>' +
                  '</form>');
                var lastform = that.element.children('form').last();
                lastform.on('change.uploadpic', 'input[type="file"]', $.proxy(UploadPic.prototype.upload.bind(that), that))
                  .on('click.uploadpic', 'span.text-loading', $.proxy(UploadPic.prototype.refresh.bind(that), that))
                  .on('click.uploadpic', 'i.remove_img', $.proxy(UploadPic.prototype.clear.bind(that), that));
              }
            }
          },
          error: function(err) {
            alert('当前系统繁忙，请稍后重试。');
          }
        })
      } else {
        form.remove();
        if ($(that.element.children('form')[0]).hasClass('more_imgbox')) {
          $(that.element.children('form')[0]).removeClass('more_imgbox')
        }
        var addBox = true;
        that.element.find('img').each(function() {
          if ($(this).attr('src') == that.imgSrc && $(this).next('.text-loading').is(":hidden"))
            addBox = false;
        })
        if (that.element.children('form').length < that.limit && addBox) {
          that.element.append('<form method="post" action="' + that.formAction +
            '" enctype="multipart/form-data" class="imagebox more_imgbox">' +
            '<input type="file" name="file" value="" accept=".png,.jpg,.jpeg" />' +
            '<img class="img-src" src="' + that.imgSrc + '" alt="" />' +
            '<span class="text-loading"><i class="loading"></i>图片上传中...</span>' +
            '<i class="remove_img"></i>' +
            '</form>');
          var lastform = that.element.children('form').last();
          lastform.on('change.uploadpic', 'input[type="file"]', $.proxy(UploadPic.prototype.upload.bind(that), that))
            .on('click.uploadpic', 'span.text-loading', $.proxy(UploadPic.prototype.refresh.bind(that), that))
            .on('click.uploadpic', 'i.remove_img', $.proxy(UploadPic.prototype.clear.bind(that), that));
        }
      }
    }
  }
  $.fn.uploadpic = function(option) {
    $(this).html('');
    //兼容 ie8
    if (!Function.prototype.bind) {
      Function.prototype.bind = function() {
        if (typeof this !== 'function') {
          throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        var _this = this;
        var obj = arguments[0];
        var ags = Array.prototype.slice.call(arguments, 1);
        return function() {
          //绑定事件参数event
          var arg = Array.prototype.slice.call(arguments);
          return _this.apply(obj, ags.concat(arg));
        };
      };
    }
    return new UploadPic($(this), option);
  }
})(jQuery);
