<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$html_values = [
    'SALE_ID' => '123456',
    'SN' => 'ABCDEF',
    'REF' => '임의 참조'
];

require_once "sales_db.php";
mysqli_set_charset($dbconnect, "utf8");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>거래명세서 수정 TEST</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css">
    <link rel="stylesheet" href="salesMain.css">
    <script src="https://unpkg.com/htmx.org@1.9.4"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.js" integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=" crossorigin="anonymous"></script>
</head>
<body>
<?php include 'navbar.php'; ?>
    <div class="main">
        <div class="header-container">
            <header>라이센스 수정</header>
        </div>
        <div class="content">
            <div class="inputBox mx-auto shadow p-5 mt-4">
                <div class="btn-cancel position-relative top-0">
                    <button type="button" class="btn-close" aria-label="Close" onclick="redirectToLicenseMain()"></button>
                </div>
                <form>
                    <table class="inputTbl">
                        <tr>
                            <td><label for="saleId">명세서번호</label></td>
                            <td><input type="text" class="text" name="saleId" id="saleId" value="<?php echo isset($html_values['SALE_ID']) ? $html_values['SALE_ID'] : ''; ?>"></td>
                            <!-- <td><input type="text" class="input" name="saleId" id="saleId" value="<?php echo $html_values['SALE_ID']?>" readonly></td> -->
                        </tr>
                        <tr>
                            <td><label for="SN">SN</label></td>
                            <td><input type="text" class="text" name="SN" id="SN" value="<?php echo isset($html_values['SN']) ? $html_values['SN'] : ''; ?>"></td>
                            <!-- <td><input type="text" class="text" name="SN" id="SN" value="<?php echo isset($html_values['SN']) ? $html_values['SN'] : ''; ?>" readonly></td> -->
                        </tr>
                        <tr>
                            <td><label for="ref">비고</label></td>
                            <td>
                                <!-- textarea에는 value 속성이 사용되지 않는다. 태그 사이에 넣어야 값이 나온다.  -->
                                <textarea class="txtarea" name="ref" id="ref" rows="2" cols="52"><?php echo isset($html_values['REF']) ? $html_values['REF'] : ''; ?></textarea>
                            </td>
                        </tr>
                    </table>
                    <div class="btn-class">
                        <button type="button" id="renewalButton" class="btn btn-primary renewal wide-btn">재계약</button>
                    </div>
                </form>        
            </div>
        </div>
    </div>
    <script>
    //'재계약' 버튼
    $("#renewalButton").click(function() {
        // 유효성 검사
        alert("재계약버튼");
        $.ajax({
            url: "licenseRenewal_test.php", 
            type: "POST",
            data: {
                saleId: $("#saleId").val(),
                SN: $("#SN").val(),
                ref : $("#ref").val()
            },
            success: function(response) {
                console.log(response);
                console.log("Server Response:", response);
                if(response.success) {
                    window.location.href='licenseMain.php';
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert("An error occurred: " + textStatus);
            }
        });
    });
     </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
    <script src="salesMain.js"></script>
    <!-- <script src="/.__/auto_complete.js"></script> -->
</body>
</html> 