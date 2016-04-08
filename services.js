$(function () {
    function input_check(input) {
        if (input === "") {
            return '<i class="fa fa-times text-danger"></i>';
        } else {
            return input;
        }
    }
    
    function validate_ip(raw_ip) {
        var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (raw_ip.match(ipformat)) {
            return true;
        } else {
            return false;
        }
    }
    
    var add_button = document.getElementById("device_add"),
        del_button = document.getElementById("dev_delete"),
        
        handler_add = function () {
            var msg = "",
                title = "Ошибка!",
                dev = document.getElementById("select_device").title,
                port = input_check(document.getElementById("port_select").value),
                ip = input_check(document.getElementById("ip_input").value),
                udp_port = input_check(document.getElementById("udp_port_input").value),
                table = $("#all_dev_table tbody")[0],
                flag = true,
                i = 1,
                leng = 0;
            
            toastr.options = {
                "closeButton": false,
                "debug": false,
                "progressBar": true,
                "preventDuplicates": false,
                "positionClass": "toast-top-right",
                "onclick": null,
                "showDuration": "400",
                "hideDuration": "1000",
                "timeOut": "7000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };
            
            if (dev === "") {
                msg = "Выберите один из узлов!";
                toastr.error(msg, title);
                return;
            }

            if (port === ip && port === udp_port) {
                msg = "Выберите хотя бы один из параметров!";
                toastr.error(msg, title);
                return;
            }
            
            if (ip !== '<i class="fa fa-times text-danger"></i>' && validate_ip(ip) === false) {
                msg = "Введен некорректный IP-Адрес!";
                toastr.error(msg, title);
                return;
            }

            for (i = 1; i < table.rows.length; i += 1) {
                if (table.rows[i].cells[1].innerHTML === dev) {
                    flag = false;
                    table.rows[i].cells[2].innerHTML = port;
                    table.rows[i].cells[3].innerHTML = ip;
                    table.rows[i].cells[4].innerHTML = udp_port;
                }
            }

            if (flag === true) {
                $('#all_dev_table tr:last').after('<tr><td><input type="checkbox" class="i-checks" name="input[]"></td><td>' + dev + '</td><td>' + port + '</td><td>' + ip + '</td><td>' + udp_port + '</td></tr>');
            }
            
            leng = table.rows.length - 1;
            document.getElementById("device_count").innerHTML = "Всего добавлено узлов: " + leng;
        },

        handler_delete = function () {
            var table = $("#all_dev_table tbody")[0],
                del_array = [],
                pointer = 0,
                i = 1,
                leng = 0;

            for (i = 1; i < table.rows.length; i += 1) {
                var row = $("#all_dev_table tbody tr")[i],
                    nnn = $(row).find("input").eq(0);
                if ($(nnn).is(":checked") === true) {
                    del_array[pointer] = i;
                    pointer += 1;
                }
            }

            for (i = del_array.length - 1; i >= 0; i -= 1) {
                $("#all_dev_table tbody tr")[del_array[i]].remove();
            }
            
            leng = table.rows.length - 1;
            document.getElementById("device_count").innerHTML = "Всего добавлено узлов: " + leng;
        };

    add_button.addEventListener("click", handler_add, false);
    del_button.addEventListener("click", handler_delete, false);
});