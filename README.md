# uploadpic
上传预览图片插件
兼容至ie8

### 需要先引用jquery和ajaxform.js插件
上传图片接口返回json demo
```
{
  returnCode: 0,
  Msg: '',
  Data: {
    FilePath: ''
  }
}
```

### default setting
```
formAction: 上传图片接口url
param: 上传图片接口参数
imgSrc: 默认图片地址
imgSize: 上传图片大小限制
downloadUrl: 预览图片接口url(get接口?filePath=" "&needMosaic=" ")
isAppend: 是否上传多张图片
limit: 限制上传图片的张数
isLoad: 是否load已有图片（无需设置isAppend属性,若仅load一张图片请将limit设为1）
needMosaic: load图片是否打码
deleteUrl: 删除图片接口地址(接口param:{filepath:'xxx'})
```
